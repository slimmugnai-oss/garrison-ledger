/**
 * TDY OCR (PDF Text Extraction)
 * 
 * v1: PDF text extraction only
 * v2: Image OCR (future)
 */

import pdfParse from 'pdf-parse';

export class UnsupportedFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedFormatError';
  }
}

/**
 * Extract text from PDF buffer
 * Throws UnsupportedFormatError for images
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    
    if (!data.text || data.text.trim().length === 0) {
      throw new UnsupportedFormatError(
        'PDF contains no extractable text. Use Manual Entry to add line items.'
      );
    }

    return data.text;

  } catch (error) {
    if (error instanceof UnsupportedFormatError) {
      throw error;
    }

    throw new UnsupportedFormatError(
      'Could not read PDF. Try a different file or use Manual Entry.'
    );
  }
}

/**
 * Detect if buffer is an image (not supported in v1)
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

