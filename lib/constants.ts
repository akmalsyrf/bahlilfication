/**
 * Constants for bahlilfication backend
 */

// Supported image formats
export const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const SUPPORTED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
] as const;

// Size limits
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_DIMENSION = 8000; // pixels

// Output formats
export const OUTPUT_FORMATS = ['jpeg', 'png', 'webp'] as const;
export type OutputFormat = typeof OUTPUT_FORMATS[number];

// Quality ranges
export const QUALITY_MIN = 1;
export const QUALITY_MAX = 100;
export const DEFAULT_QUALITY = 90;

// Timeouts
export const DEFAULT_PROCESSING_TIMEOUT = 30000; // 30 seconds
export const MAX_FUNCTION_DURATION = 30; // seconds (Vercel limit on Hobby)

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  INTERNAL_SERVER_ERROR: 500,
  GATEWAY_TIMEOUT: 504,
} as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Image processing defaults
export const DEFAULT_PROCESSING_OPTIONS = {
  brightness: 1.05,
  saturation: 1.4,
  contrastMultiplier: 1.2,
  contrastOffset: -(128 * 0.2),
  sharpenSigma: 1.5,
  sharpenM1: 1.0,
  sharpenM2: 0.5,
  vignetteOpacity: 0.3,
} as const;

// Response headers
export const CACHE_HEADERS = {
  NO_CACHE: 'no-store, must-revalidate',
  PUBLIC_LONG: 'public, max-age=31536000, immutable',
  PUBLIC_SHORT: 'public, max-age=3600',
} as const;

