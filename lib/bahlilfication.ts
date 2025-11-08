/**
 * Core bahlilfication image processing logic
 * 
 * Pixel Rearrangement Algorithm inspired by:
 * https://www.instagram.com/reel/DQl5qErDaBc/?igsh=MW5iMGgwaW1sOG5rYw==
 * 
 * Takes every pixel from input image and rearranges them mathematically
 * to form the target face - like the Obama algorithm!
 */

import sharp from 'sharp';
import { config } from './config';
import { validateDimensions } from './validation';
import { rearrangePixelsToTarget } from './pixel-rearrangement';
import path from 'path';

export interface ProcessingResult {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Apply the bahlilfication transformation to an image buffer
 * 
 * PIXEL REARRANGEMENT: Takes every pixel and rearranges them to form target face
 * Like the Obama algorithm - mathematically optimal pixel mapping!
 */
export async function bahlilfy(inputBuffer: Buffer): Promise<ProcessingResult> {
  try {
    // Load input image and get metadata
    const inputImage = sharp(inputBuffer);
    const inputMetadata = await inputImage.metadata();
    
    if (!inputMetadata.width || !inputMetadata.height) {
      throw new Error('Unable to determine image dimensions');
    }
    
    validateDimensions(inputMetadata.width, inputMetadata.height);
    
    // Load the target bahlilfication face from public folder
    const targetFacePath = path.join(process.cwd(), 'public', 'target-face.png');
    
    try {
      // Normalize input image orientation
      const normalizedInput = await inputImage.rotate().toBuffer();
      
      // Load target face
      const targetFaceBuffer = await sharp(targetFacePath).toBuffer();
      
      // Apply pixel rearrangement algorithm!
      // This takes every pixel from input and rearranges them
      // to mathematically form the target face
      const rearrangedBuffer = await rearrangePixelsToTarget(
        normalizedInput,
        targetFaceBuffer,
        inputMetadata.width,
        inputMetadata.height,
        {
          mosaicBlockSize: config.mosaic.blockSize,
          jitter: config.mosaic.jitter,
          sampleStep: config.mosaic.blockSize,
        }
      );
      
      // Composite rearranged face (transparent background) over original uploaded image
      const baseWithBg = await sharp(normalizedInput)
        .ensureAlpha()
        .toBuffer();
      
      const composited = await sharp(baseWithBg)
        .composite([{ input: rearrangedBuffer }])
        .toBuffer();
      
      // Post-process
      // If strictColorPreservation is enabled, emit as-is (no color changes)
      // Otherwise, apply gentle enhancement for vibrancy
      const pipeline = sharp(composited);
      if (!config.strictColorPreservation) {
        pipeline
          .modulate({
            brightness: 1.1,
            saturation: 1.2,
          })
          .sharpen({
            sigma: 1.0,
          })
          .linear(1.05, -(128 * 0.05));
      }
      
      const processed = await pipeline
        .toFormat(config.output.format, {
          quality: config.output.quality,
        })
        .toBuffer({ resolveWithObject: true });
      
      return {
        buffer: processed.data,
        width: processed.info.width,
        height: processed.info.height,
        format: processed.info.format,
        size: processed.data.byteLength,
      };
      
    } catch (faceError) {
      throw new Error(`Failed to load target-face.png. Make sure the file exists in /public/target-face.png. Error: ${faceError instanceof Error ? faceError.message : 'Unknown'}`);
    }
    
  } catch (error) {
    if (config.debug) {
      console.error('Processing error:', error);
    }
    throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get estimated processing time for given dimensions
 */
export function estimateProcessingTime(width: number, height: number): number {
  const pixels = width * height;
  // Rough estimate: ~10ms per megapixel
  return Math.ceil((pixels / 1000000) * 10);
}

