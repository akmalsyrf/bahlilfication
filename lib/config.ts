/**
 * Configuration management for bahlilfication backend
 */

export const config = {
  // File size limits
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
  
  // Supported MIME types
  supportedFormats: (
    process.env.SUPPORTED_FORMATS || 'image/jpeg,image/png,image/webp'
  ).split(','),
  
  // Processing
  processingTimeout: parseInt(process.env.PROCESSING_TIMEOUT || '30000', 10),
  
  // Output settings
  output: {
    format: (process.env.OUTPUT_FORMAT || 'png') as 'jpeg' | 'png' | 'webp',
    quality: parseInt(process.env.OUTPUT_QUALITY || '90', 10),
  },
  
  // Color policy
  // When true, we avoid post-processing that could alter source colors,
  // preserving exact input pixel colors in the final image.
  strictColorPreservation: process.env.STRICT_COLOR_PRESERVATION !== 'false',
  
  // Mosaic look configuration (to emphasize "built from uploaded pixels")
  mosaic: {
    // Size of square tiles in pixels (higher = coarser, more blocky)
    blockSize: parseInt(process.env.MOSAIC_BLOCK_SIZE || '6', 10),
    // Random jitter applied to tile placement (0..blockSize/2 recommended)
    jitter: parseInt(process.env.MOSAIC_JITTER || '2', 10),
  },
  
  // Debug
  debug: process.env.DEBUG === 'true',
  
  // Storage (optional)
  blobToken: process.env.BLOB_READ_WRITE_TOKEN,
} as const;

export type Config = typeof config;

