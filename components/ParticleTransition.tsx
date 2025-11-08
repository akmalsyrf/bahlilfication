'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  originalX?: number;
  originalY?: number;
  scatterTargetX?: number;
  scatterTargetY?: number;
}

interface ParticleTransitionProps {
  fromImage: string;
  toImage: string;
  width: number;
  height: number;
  onComplete?: () => void;
  duration?: number;
}

export default function ParticleTransition({
  fromImage,
  toImage,
  width,
  height,
  onComplete,
  duration = 3000,
}: ParticleTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    let animationId: number;
    let particles: Particle[] = [];
    let startTime: number;
    
    const loadImages = async () => {
      const fromImg = new Image();
      const targetImg = new Image();
      fromImg.crossOrigin = 'anonymous';
      targetImg.crossOrigin = 'anonymous';
      
      return new Promise<void>((resolve) => {
        let fromLoaded = false;
        let targetLoaded = false;
        
        const checkBothLoaded = () => {
          if (fromLoaded && targetLoaded) {
            // Create particles from ORIGINAL image pixels
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (!tempCtx) return;
            
            // Get original (uploaded) image pixel data
            tempCtx.drawImage(fromImg, 0, 0, width, height);
            const fromImageData = tempCtx.getImageData(0, 0, width, height);
            
            // Get target face pixel data (for shape/structure)
            tempCtx.clearRect(0, 0, width, height);
            tempCtx.drawImage(targetImg, 0, 0, width, height);
            const targetImageData = tempCtx.getImageData(0, 0, width, height);
            
            // Map ORIGINAL pixels to TARGET positions by brightness rank
            const step = 4; // Sample every 4th pixel for performance
            type SamplePoint = { x: number; y: number; r: number; g: number; b: number; a: number; brightness: number };
            const fromPoints: SamplePoint[] = [];
            const toPoints: SamplePoint[] = [];
            const brightness = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
            // Collect sampled points from ORIGINAL image
            for (let y = 0; y < height; y += step) {
              for (let x = 0; x < width; x += step) {
                const i = (y * width + x) * 4;
                const r = fromImageData.data[i];
                const g = fromImageData.data[i + 1];
                const b = fromImageData.data[i + 2];
                const a = fromImageData.data[i + 3];
                if (a > 50) {
                  fromPoints.push({ x, y, r, g, b, a, brightness: brightness(r, g, b) });
                }
              }
            }
            // Collect sampled points from TARGET image (shape)
            for (let y = 0; y < height; y += step) {
              for (let x = 0; x < width; x += step) {
                const i = (y * width + x) * 4;
                const r = targetImageData.data[i];
                const g = targetImageData.data[i + 1];
                const b = targetImageData.data[i + 2];
                const a = targetImageData.data[i + 3];
                if (a > 50) {
                  toPoints.push({ x, y, r, g, b, a, brightness: brightness(r, g, b) });
                }
              }
            }
            // Sort by brightness and pair them
            fromPoints.sort((p, q) => p.brightness - q.brightness);
            toPoints.sort((p, q) => p.brightness - q.brightness);
            const count = Math.min(fromPoints.length, toPoints.length);
            particles = new Array<Particle>(count);
            for (let i = 0; i < count; i++) {
              const fromP = fromPoints[i];
              const toP = toPoints[i];
              particles[i] = {
                x: fromP.x,
                y: fromP.y,
                targetX: toP.x,
                targetY: toP.y,
                color: `rgba(${fromP.r},${fromP.g},${fromP.b},${fromP.a / 255})`,
                size: step,
                vx: 0,
                vy: 0,
                originalX: fromP.x,
                originalY: fromP.y,
              };
            }
            
            resolve();
          }
        };
        
        fromImg.onload = () => {
          fromLoaded = true;
          checkBothLoaded();
        };
        
        targetImg.onload = () => {
          targetLoaded = true;
          checkBothLoaded();
        };
        
        fromImg.src = fromImage;
        targetImg.src = toImage;
      });
    };
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Animation phases:
      // 0.0 - 0.2 (20%): Show original image
      // 0.2 - 0.4 (20%): Scatter particles
      // 0.4 - 1.0 (60%): Converge to target
      
      const showOriginalPhase = 0.2;
      const scatterPhase = 0.4;
      
      // Clear canvas
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillRect(0, 0, width, height);
      
      // Update particle positions based on phase
      // Phase 1: Show original image (particles at original positions)
      if (progress < showOriginalPhase) {
        // Just show particles at original positions (forms original image)
        // Do nothing - particles stay at x, y
      }
      // Phase 2: Scatter particles
      else if (progress < scatterPhase) {
        const scatterProgress = (progress - showOriginalPhase) / (scatterPhase - showOriginalPhase);
        
        // Scatter particles to random positions
        particles.forEach((particle) => {
          if (particle.scatterTargetX === undefined || particle.scatterTargetY === undefined) {
            // Set random scatter target (only once)
            particle.scatterTargetX = Math.random() * width;
            particle.scatterTargetY = Math.random() * height;
            particle.originalX = particle.originalX ?? particle.x;
            particle.originalY = particle.originalY ?? particle.y;
          }
          
          // Interpolate to scattered position
          const eased = scatterProgress; // Linear for scatter
          const origX = particle.originalX!;
          const origY = particle.originalY!;
          const sX = particle.scatterTargetX!;
          const sY = particle.scatterTargetY!;
          particle.x = origX + (sX - origX) * eased;
          particle.y = origY + (sY - origY) * eased;
        });
      }
      // Phase 3: Converge to target
      else {
        const convergeProgress = (progress - scatterPhase) / (1 - scatterPhase);
        const eased = 1 - Math.pow(1 - convergeProgress, 3);
        
        particles.forEach((particle) => {
          if (convergeProgress < 0.95) {
            // Physics-based movement
            const dx = particle.targetX - particle.x;
            const dy = particle.targetY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0.5) {
              // Attraction force
              const force = distance * 0.08 * (1 - eased * 0.5);
              particle.vx += (dx / distance) * force;
              particle.vy += (dy / distance) * force;
              
              // Damping
              particle.vx *= 0.88;
              particle.vy *= 0.88;
              
              // Update position
              particle.x += particle.vx;
              particle.y += particle.vy;
            } else {
              // Snap to target
              particle.x = particle.targetX;
              particle.y = particle.targetY;
              particle.vx = 0;
              particle.vy = 0;
            }
          } else {
            // Final lock
            particle.x = particle.targetX;
            particle.y = particle.targetY;
          }
        });
      }
      
      // Draw all particles
      particles.forEach((particle) => {
        // Draw particle with slight glow effect
        ctx.fillStyle = particle.color;
        
        // Add glow when moving fast
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > 2) {
          ctx.shadowBlur = speed * 0.5;
          ctx.shadowColor = particle.color;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fillRect(
          Math.round(particle.x),
          Math.round(particle.y),
          particle.size,
          particle.size
        );
      });
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        // Animation complete - draw final image
        const finalImg = new Image();
        finalImg.onload = () => {
          ctx.drawImage(finalImg, 0, 0, width, height);
          onComplete?.();
        };
        finalImg.src = toImage;
      }
    };
    
    // Start animation
    loadImages().then(() => {
      animationId = requestAnimationFrame(animate);
    });
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [fromImage, toImage, width, height, duration, onComplete]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-full object-cover"
    />
  );
}

