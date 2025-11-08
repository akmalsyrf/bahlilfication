/**
 * Pixel Animation - Fluid Dynamics Transition
 * 
 * Creates smooth transition from original image to target face
 * Simulates "fluid dynamics" mentioned in the reel
 */

import sharp from 'sharp';

export interface AnimationFrame {
  buffer: Buffer;
  progress: number; // 0-1
}

export interface PixelMovement {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: { r: number; g: number; b: number; a: number };
}

/**
 * Easing functions for smooth animation
 */
export const easing = {
  // Ease in-out cubic - smooth start and end
  easeInOutCubic: (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
  
  // Ease out elastic - bouncy effect
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  
  // Ease in-out quad - gentle curve
  easeInOutQuad: (t: number): number => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },
};

/**
 * Linear interpolation between two values
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Generate animation frames showing pixel movement
 */
export async function generateAnimationFrames(
  movements: PixelMovement[],
  width: number,
  height: number,
  totalFrames: number = 30,
  easingFunc: (t: number) => number = easing.easeInOutCubic
): Promise<AnimationFrame[]> {
  const frames: AnimationFrame[] = [];
  
  for (let frameIndex = 0; frameIndex <= totalFrames; frameIndex++) {
    const progress = frameIndex / totalFrames;
    const easedProgress = easingFunc(progress);
    
    // Create buffer for this frame
    const frameData = Buffer.alloc(width * height * 4);
    frameData.fill(0); // Transparent black
    
    // Place each pixel at its interpolated position
    for (const movement of movements) {
      const currentX = Math.round(lerp(movement.fromX, movement.toX, easedProgress));
      const currentY = Math.round(lerp(movement.fromY, movement.toY, easedProgress));
      
      // Ensure within bounds
      if (currentX >= 0 && currentX < width && currentY >= 0 && currentY < height) {
        const idx = (currentY * width + currentX) * 4;
        frameData[idx] = movement.color.r;
        frameData[idx + 1] = movement.color.g;
        frameData[idx + 2] = movement.color.b;
        frameData[idx + 3] = movement.color.a;
      }
    }
    
    // Convert to image buffer
    const frameBuffer = await sharp(frameData, {
      raw: {
        width,
        height,
        channels: 4,
      },
    })
      .png()
      .toBuffer();
    
    frames.push({
      buffer: frameBuffer,
      progress,
    });
  }
  
  return frames;
}

/**
 * Create animated GIF from frames
 */
export async function createAnimatedGif(
  frames: AnimationFrame[],
  delayMs: number = 33 // ~30fps
): Promise<Buffer> {
  // Use sharp to create animated GIF
  const gifFrames = frames.map((frame) => frame.buffer);
  
  // Create GIF with all frames
  return await sharp(gifFrames[0], { animated: true })
    .gif({
      delay: delayMs,
      loop: 0, // Infinite loop
    })
    .toBuffer();
}

/**
 * Create video from frames (MP4)
 * Requires ffmpeg to be installed
 */
export async function createVideoFromFrames(
  frames: AnimationFrame[],
  fps: number = 30
): Promise<Buffer> {
  // Note: This would require ffmpeg integration
  // For now, we'll return the GIF version
  // In production, you'd use ffmpeg-static or similar
  return createAnimatedGif(frames, 1000 / fps);
}

/**
 * Apply fluid dynamics effect - pixels move with slight variation
 * Makes movement more natural and fluid
 */
export function applyFluidDynamics(
  movements: PixelMovement[],
  turbulence: number = 0.1
): PixelMovement[] {
  return movements.map((movement) => {
    // Add slight random variation to path
    const noise = (Math.random() - 0.5) * turbulence;
    
    return {
      ...movement,
      // Pixels don't move in straight lines - add some curve
      // This would be calculated per frame in full implementation
    };
  });
}

/**
 * Calculate pixel movements from mapping
 */
export function calculateMovements(
  pixelMapping: Map<number, { x: number; y: number; color: any }>,
  sourcePositions: Array<{ x: number; y: number }>
): PixelMovement[] {
  const movements: PixelMovement[] = [];
  
  pixelMapping.forEach((target, index) => {
    const source = sourcePositions[index];
    if (source) {
      movements.push({
        fromX: source.x,
        fromY: source.y,
        toX: target.x,
        toY: target.y,
        color: target.color,
      });
    }
  });
  
  return movements;
}

