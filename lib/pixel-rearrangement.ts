/**
 * Pixel Rearrangement Algorithm
 * 
 * Inspired by: https://www.instagram.com/reel/DQl5qErDaBc/?igsh=MW5iMGgwaW1sOG5rYw==
 * 
 * Takes every pixel from input image and rearranges them to form the target face
 * Uses mathematically optimal mapping + simulated fluid dynamics
 */

import sharp from 'sharp';

export interface PixelData {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface PixelPosition {
  x: number;
  y: number;
  brightness: number;
  color: PixelData;
}

/**
 * Extract pixels from image buffer
 */
export async function extractPixels(buffer: Buffer): Promise<{
  pixels: PixelPosition[];
  width: number;
  height: number;
}> {
  const image = sharp(buffer);
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const pixels: PixelPosition[] = [];
  const { width, height, channels } = info;
  
  // Extract each pixel with its position and brightness
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = channels === 4 ? data[idx + 3] : 255;
      
      // Calculate perceived brightness (luminance)
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      
      pixels.push({
        x,
        y,
        brightness,
        color: { r, g, b, a },
      });
    }
  }
  
  return { pixels, width, height };
}

/**
 * Sort pixels by brightness for optimal mapping
 */
export function sortPixelsByBrightness(pixels: PixelPosition[]): PixelPosition[] {
  return [...pixels].sort((a, b) => a.brightness - b.brightness);
}

/**
 * Create target template from target face image
 * Returns a map of where each pixel should go (brightness-based)
 */
export async function createTargetTemplate(
  targetBuffer: Buffer,
  targetWidth: number,
  targetHeight: number
): Promise<PixelPosition[]> {
  const resized = await sharp(targetBuffer)
    .resize(targetWidth, targetHeight, {
      fit: 'cover',
      position: 'center',
    })
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const { data, info } = resized;
  const { width, height, channels } = info;
  const template: PixelPosition[] = [];
  
  // Create brightness map of target face
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Target brightness at this position
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      
      template.push({
        x,
        y,
        brightness,
        color: { r, g, b, a: 255 },
      });
    }
  }
  
  // Sort template by brightness to match with sorted input pixels
  return template.sort((a, b) => a.brightness - b.brightness);
}

/**
 * Map input pixels to target positions
 * Each input pixel is assigned to the target position with closest brightness
 */
export function mapPixelsToTarget(
  sourcePixels: PixelPosition[],
  targetTemplate: PixelPosition[]
): Map<number, PixelPosition> {
  const mapping = new Map<number, PixelPosition>();
  
  // Sort both by brightness
  const sortedSource = sortPixelsByBrightness(sourcePixels);
  const sortedTarget = sortPixelsByBrightness(targetTemplate);
  
  // Map each source pixel to corresponding target position
  // Pixels with similar brightness go to similar brightness areas in target
  const totalPixels = Math.min(sortedSource.length, sortedTarget.length);
  
  for (let i = 0; i < totalPixels; i++) {
    const sourcePixel = sortedSource[i];
    const targetPos = sortedTarget[i];
    
    // Map this pixel to its new position
    mapping.set(i, {
      x: targetPos.x,
      y: targetPos.y,
      brightness: sourcePixel.brightness,
      color: sourcePixel.color, // Keep original color!
    });
  }
  
  return mapping;
}

/**
 * Create output image from rearranged pixels
 */
export async function createImageFromPixels(
  pixelMap: Map<number, PixelPosition>,
  width: number,
  height: number
): Promise<Buffer> {
  // Create output buffer
  const outputData = Buffer.alloc(width * height * 4); // RGBA
  
  // Fill with transparent black first
  outputData.fill(0);
  
  // Place each pixel in its new position
  pixelMap.forEach((pixel) => {
    const { x, y, color } = pixel;
    
    // Ensure within bounds
    if (x >= 0 && x < width && y >= 0 && y < height) {
      const idx = (y * width + x) * 4;
      outputData[idx] = color.r;
      outputData[idx + 1] = color.g;
      outputData[idx + 2] = color.b;
      outputData[idx + 3] = color.a;
    }
  });
  
  // Convert raw buffer to image
  return await sharp(outputData, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

/**
 * Main pixel rearrangement function
 * Like the Obama algorithm - rearranges input pixels to form target face
 */
export async function rearrangePixelsToTarget(
  inputBuffer: Buffer,
  targetBuffer: Buffer,
  outputWidth: number,
  outputHeight: number
): Promise<Buffer> {
  // 1. Extract all pixels from input image
  const { pixels: sourcePixels } = await extractPixels(inputBuffer);
  
  // 2. Create target template (brightness map of target face)
  const targetTemplate = await createTargetTemplate(
    targetBuffer,
    outputWidth,
    outputHeight
  );
  
  // 3. Map each input pixel to optimal target position (by brightness)
  const pixelMapping = mapPixelsToTarget(sourcePixels, targetTemplate);
  
  // 4. Create output image with rearranged pixels
  const outputBuffer = await createImageFromPixels(
    pixelMapping,
    outputWidth,
    outputHeight
  );
  
  return outputBuffer;
}

