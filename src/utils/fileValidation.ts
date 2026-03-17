import { config } from '../config';

export interface FileValidationError {
  file: File;
  error: string;
}

export interface FileValidationResult {
  valid: File[];
  invalid: FileValidationError[];
}

/**
 * Validate files before upload
 */
export function validateFiles(files: File[]): FileValidationResult {
  const valid: File[] = [];
  const invalid: FileValidationError[] = [];

  // Check if too many files
  if (files.length > config.upload.maxFiles) {
    return {
      valid: [],
      invalid: files.map((file) => ({
        file,
        error: `Too many files. Maximum ${config.upload.maxFiles} files allowed.`,
      })),
    };
  }

  for (const file of files) {
    const error = validateSingleFile(file);

    if (error) {
      invalid.push({ file, error });
    } else {
      valid.push(file);
    }
  }

  return { valid, invalid };
}

/**
 * Validate a single file
 */
function validateSingleFile(file: File): string | null {
  // Check file size
  if (file.size > config.upload.maxFileSize) {
    const maxSizeMB = Math.round(config.upload.maxFileSize / (1024 * 1024));
    return `File size exceeds ${maxSizeMB}MB limit`;
  }

  // Check file type
  const allowedTypes = [
    ...config.upload.allowedTypes.image,
    ...config.upload.allowedTypes.video,
    ...config.upload.allowedTypes.document,
  ];

  if (!allowedTypes.includes(file.type)) {
    return `File type "${file.type}" is not supported`;
  }

  return null;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file type category
 */
export function getFileTypeCategory(mimeType: string): 'image' | 'video' | 'document' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'document';
}

/**
 * Check if file type is allowed
 */
export function isFileTypeAllowed(mimeType: string): boolean {
  const allowedTypes = [
    ...config.upload.allowedTypes.image,
    ...config.upload.allowedTypes.video,
    ...config.upload.allowedTypes.document,
  ];

  return allowedTypes.includes(mimeType);
}
