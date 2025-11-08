/**
 * Custom error classes for bahlilfication
 */

export class BahlilError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'BahlilError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BahlilError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class ProcessingError extends BahlilError {
  constructor(message: string) {
    super(message, 500, 'PROCESSING_ERROR');
    this.name = 'ProcessingError';
  }
}

export class TimeoutError extends BahlilError {
  constructor(message: string = 'Processing timeout') {
    super(message, 504, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

export function isKnownError(error: unknown): error is BahlilError {
  return error instanceof BahlilError;
}

export function formatError(error: unknown): { message: string; code: string } {
  if (isKnownError(error)) {
    return {
      message: error.message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

