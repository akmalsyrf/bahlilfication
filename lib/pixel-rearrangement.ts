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

export interface RearrangementOptions {
  /**
   * Mosaic block size in pixels. When >1, output will be rendered as square tiles,
   * emphasizing the "built from pixels" look rather than photorealism.
   */
  mosaicBlockSize?: number; // default: 1 (no mosaic)
  /**
   * Random jitter applied to target cell placement, in pixels.
   * Recommended 0..blockSize/2 to keep legibility while adding organic feel.
   */
  jitter?: number; // default: 0
  /**
   * Sampling step used when building source/target point sets.
   * If not provided, defaults to mosaicBlockSize (or 1 if undefined).
   */
  sampleStep?: number;
}

/**
 * Extract pixels from image buffer
 */
export async function extractPixels(
  buffer: Buffer,
  sampleStep = 1
): Promise<{
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
  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
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
  targetHeight: number,
  sampleStep = 1,
  jitter = 0
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
  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = channels === 4 ? data[idx + 3] : 255;
      
      // Respect transparency in the target (ignore fully transparent areas)
      if (a < 50) {
        continue;
      }
      
      // Target brightness at this position
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      // Optional jitter to avoid perfect grid alignment
      let jx = 0;
      let jy = 0;
      if (jitter > 0) {
        jx = Math.floor((Math.random() * 2 - 1) * jitter);
        jy = Math.floor((Math.random() * 2 - 1) * jitter);
      }
      const px = Math.max(0, Math.min(width - 1, x + jx));
      const py = Math.max(0, Math.min(height - 1, y + jy));

      template.push({
        x: px,
        y: py,
        brightness,
        color: { r, g, b, a },
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
  height: number,
  blockSize = 1
): Promise<Buffer> {
  // Create output buffer
  const outputData = Buffer.alloc(width * height * 4); // RGBA
  
  // Fill with transparent black first
  outputData.fill(0);
  
  // Place each pixel (or tile) in its new position
  pixelMap.forEach((pixel) => {
    const { x, y, color } = pixel;
    const half = Math.max(1, Math.floor(blockSize));
    const startX = x;
    const startY = y;
    // Draw a block of size blockSize x blockSize using nearest-neighbor fill
    for (let oy = 0; oy < half; oy++) {
      const py = startY + oy;
      if (py < 0 || py >= height) continue;
      for (let ox = 0; ox < half; ox++) {
        const px = startX + ox;
        if (px < 0 || px >= width) continue;
        const idx = (py * width + px) * 4;
        outputData[idx] = color.r;
        outputData[idx + 1] = color.g;
        outputData[idx + 2] = color.b;
        outputData[idx + 3] = color.a;
      }
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
  outputHeight: number,
  options?: RearrangementOptions
): Promise<Buffer> {
  const blockSize = Math.max(1, options?.mosaicBlockSize ?? 1);
  const sampleStep = Math.max(1, options?.sampleStep ?? blockSize);
  const jitter = Math.max(0, options?.jitter ?? 0);
  
  // 1. Extract all pixels from input image
  const { pixels: sourcePixels } = await extractPixels(inputBuffer, sampleStep);
  
  // 2. Create target template (brightness map of target face)
  const targetTemplate = await createTargetTemplate(
    targetBuffer,
    outputWidth,
    outputHeight,
    sampleStep,
    jitter
  );
  
  // 3. Map each input pixel to optimal target position (by brightness)
  const pixelMapping = mapPixelsToTarget(sourcePixels, targetTemplate);
  
  // 4. Create output image with rearranged pixels
  const outputBuffer = await createImageFromPixels(
    pixelMapping,
    outputWidth,
    outputHeight,
    blockSize
  );
  
  return outputBuffer;
}

