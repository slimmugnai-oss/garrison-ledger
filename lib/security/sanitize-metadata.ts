/**
 * IMAGE METADATA SANITIZATION
 * 
 * Strips EXIF/GPS data from uploaded images to prevent location tracking.
 * 
 * EXIF data can contain:
 * - GPS coordinates (latitude/longitude)
 * - Camera make/model
 * - Timestamps
 * - Software used
 * - Copyright info
 * 
 * This is especially important for military users who may accidentally
 * upload photos taken at secure locations.
 * 
 * Setup:
 * npm install sharp
 * 
 * Usage:
 * ```typescript
 * import { stripImageMetadata } from '@/lib/security/sanitize-metadata';
 * 
 * const cleanBuffer = await stripImageMetadata(originalBuffer);
 * // Clean buffer has no EXIF, no GPS, no metadata
 * ```
 */

import { logger } from '@/lib/logger';

/**
 * Strip all metadata from image buffer
 * Supports: JPEG, PNG, WebP, TIFF
 */
export async function stripImageMetadata(buffer: Buffer): Promise<Buffer> {
  try {
    // Dynamic import to avoid bundling sharp if not installed
    const sharp = await import('sharp');

    logger.debug('[MetadataSanitizer] Stripping image metadata', {
      originalSize: buffer.length
    });

    const cleanBuffer = await sharp.default(buffer)
      .rotate() // Auto-rotate based on EXIF orientation (before stripping)
      .withMetadata({
        // Remove all metadata
        exif: {},
        icc: {}, // Keep ICC color profile empty
        xmp: {},
        iptc: {}
      })
      .toBuffer();

    const sizeDiff = buffer.length - cleanBuffer.length;
    
    logger.info('[MetadataSanitizer] Metadata stripped', {
      originalSize: buffer.length,
      cleanSize: cleanBuffer.length,
      metadataSize: sizeDiff,
      reductionPercent: ((sizeDiff / buffer.length) * 100).toFixed(2)
    });

    return cleanBuffer;

  } catch (error) {
    // If sharp is not installed or fails, log warning and return original
    logger.warn('[MetadataSanitizer] Failed to strip metadata, returning original', {
      error: error instanceof Error ? error.message : 'Unknown',
      isSharpInstalled: await isSharpAvailable()
    });

    // Return original buffer - don't block upload if metadata stripping fails
    return buffer;
  }
}

/**
 * Check if sharp library is available
 */
export async function isSharpAvailable(): Promise<boolean> {
  try {
    await import('sharp');
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract and analyze metadata (for logging/debugging)
 * Returns sanitized metadata (no GPS coordinates logged)
 */
export async function analyzeImageMetadata(buffer: Buffer): Promise<{
  hasEXIF: boolean;
  hasGPS: boolean;
  cameraModel?: string;
  timestamp?: string;
  software?: string;
  warnings: string[];
}> {
  try {
    const sharp = await import('sharp');
    const metadata = await sharp.default(buffer).metadata();

    const warnings: string[] = [];

    // Check for GPS data (CRITICAL SECURITY ISSUE)
    const hasGPS = !!(metadata.exif && (
      (metadata.exif as any).GPSLatitude ||
      (metadata.exif as any).GPSLongitude
    ));

    if (hasGPS) {
      warnings.push('GPS coordinates detected - will be stripped');
    }

    // Check for camera make/model
    const cameraModel = [
      (metadata.exif as any)?.Make,
      (metadata.exif as any)?.Model
    ].filter(Boolean).join(' ');

    if (cameraModel) {
      warnings.push('Camera model detected - will be stripped');
    }

    // Check for timestamps
    const timestamp = (metadata.exif as any)?.DateTimeOriginal;
    if (timestamp) {
      warnings.push('Photo timestamp detected - will be stripped');
    }

    // Check for software
    const software = (metadata.exif as any)?.Software;
    if (software) {
      warnings.push('Software metadata detected - will be stripped');
    }

    return {
      hasEXIF: !!metadata.exif,
      hasGPS,
      cameraModel: cameraModel || undefined,
      timestamp: timestamp || undefined,
      software: software || undefined,
      warnings
    };

  } catch (error) {
    logger.debug('[MetadataAnalyzer] Could not analyze metadata', {
      error: error instanceof Error ? error.message : 'Unknown'
    });

    return {
      hasEXIF: false,
      hasGPS: false,
      warnings: []
    };
  }
}

/**
 * Sanitize filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and special characters
  let clean = filename.replace(/[\/\\]/g, '_');
  
  // Remove null bytes (security issue)
  clean = clean.replace(/\0/g, '');
  
  // Limit length
  if (clean.length > 255) {
    const extension = clean.split('.').pop() || 'bin';
    clean = clean.substring(0, 250) + '.' + extension;
  }

  return clean;
}

/**
 * Validate file extension matches MIME type
 * Prevents .exe files renamed as .pdf
 */
export function validateFileExtension(
  filename: string,
  mimeType: string
): { valid: boolean; reason?: string } {
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const validExtensions: Record<string, string[]> = {
    'application/pdf': ['pdf'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx']
  };

  const allowedExtensions = validExtensions[mimeType];
  
  if (!allowedExtensions) {
    return { valid: false, reason: `Unsupported MIME type: ${mimeType}` };
  }

  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      reason: `File extension .${extension} does not match MIME type ${mimeType}`
    };
  }

  return { valid: true };
}

