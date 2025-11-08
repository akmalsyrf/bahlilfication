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
  
  // Debug
  debug: process.env.DEBUG === 'true',
  
  // Storage (optional)
  blobToken: process.env.BLOB_READ_WRITE_TOKEN,
} as const;

export type Config = typeof config;

