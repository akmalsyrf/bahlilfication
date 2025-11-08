/**
 * POST /api/bahlilfy
 * 
 * Main API endpoint for bahlilfication image transformation
 * Accepts multipart/form-data with 'file' field containing an image
 */

import { NextRequest, NextResponse } from 'next/server';
import { bahlilfy } from '@/lib/bahlilfication';
import { validateFile } from '@/lib/validation';
import { ValidationError, isKnownError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';

export const runtime = 'nodejs';
export const maxDuration = 30; // Vercel function timeout

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const log = logger.child({ requestId, endpoint: '/api/bahlilfy' });
  
  const startTime = Date.now();
  
  try {
    log.info('Processing bahlilfication request');
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    // Validate input
    if (!file || !(file instanceof File)) {
      throw new ValidationError('No valid file provided');
    }
    
    validateFile(file);
    
    log.debug('File validated', {
      filename: file.name,
      size: file.size,
      type: file.type,
    });
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Process the image
    const result = await bahlilfy(buffer);
    
    const processingTime = Date.now() - startTime;
    
    log.info('Processing complete', {
      processingTime,
      inputSize: file.size,
      outputSize: result.size,
      dimensions: `${result.width}x${result.height}`,
      format: result.format,
    });
    
    // Return the processed image
    return new NextResponse(result.buffer as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': `image/${result.format}`,
        'Content-Length': result.size.toString(),
        'Content-Disposition': `attachment; filename="bahlilfied.${result.format}"`,
        'X-Processing-Time': processingTime.toString(),
        'X-Image-Width': result.width.toString(),
        'X-Image-Height': result.height.toString(),
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    if (isKnownError(error)) {
      log.warn('Known error', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        processingTime,
      });
      
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    
    log.error('Unexpected error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime,
    });
    
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'bahlilfication-backend',
    version: '1.0.0',
    config: {
      maxFileSize: config.maxFileSize,
      supportedFormats: config.supportedFormats,
      outputFormat: config.output.format,
    },
  });
}

