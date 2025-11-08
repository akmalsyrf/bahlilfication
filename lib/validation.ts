/**
 * Input validation utilities
 */

import { config } from './config';
import { ValidationError } from './errors';

/**
 * Validates uploaded file meets requirements
 */
export function validateFile(file: File | null | undefined): asserts file is File {
  if (!file) {
    throw new ValidationError('No file provided', 400);
  }

  // Check file size
  if (file.size > config.maxFileSize) {
    throw new ValidationError(
      `File too large. Maximum size: ${(config.maxFileSize / 1024 / 1024).toFixed(1)}MB`,
      413
    );
  }

  if (file.size === 0) {
    throw new ValidationError('File is empty', 400);
  }

  // Check MIME type
  if (!config.supportedFormats.includes(file.type)) {
    throw new ValidationError(
      `Unsupported file type: ${file.type}. Supported: ${config.supportedFormats.join(', ')}`,
      415
    );
  }
}

/**
 * Validates image dimensions
 */
export function validateDimensions(width: number, height: number): void {
  const maxDimension = 8000; // Reasonable limit
  
  if (width <= 0 || height <= 0) {
    throw new ValidationError('Invalid image dimensions', 400);
  }
  
  if (width > maxDimension || height > maxDimension) {
    throw new ValidationError(
      `Image dimensions too large. Maximum: ${maxDimension}px per side`,
      400
    );
  }
}

