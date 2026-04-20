/**
 * Image optimization utilities for product images
 * Compresses images while maintaining quality
 */

export const IMAGE_CONFIG = {
  MAX_WIDTH: 2000,
  MAX_HEIGHT: 2000,
  QUALITY: 0.8,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};

/**
 * Compress image using canvas
 * @param {string} base64String - Base64 encoded image
 * @param {number} quality - Quality 0-1 (default 0.8)
 * @returns {Promise<string>} Compressed base64 image
 */
export async function compressImage(base64String, quality = IMAGE_CONFIG.QUALITY) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > IMAGE_CONFIG.MAX_WIDTH || height > IMAGE_CONFIG.MAX_HEIGHT) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = IMAGE_CONFIG.MAX_WIDTH;
            height = width / aspectRatio;
          } else {
            height = IMAGE_CONFIG.MAX_HEIGHT;
            width = height * aspectRatio;
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        // Check file size and retry with lower quality if needed
        if (compressedBase64.length > IMAGE_CONFIG.MAX_FILE_SIZE && quality > 0.5) {
          return compressImage(base64String, quality - 0.1);
        }

        resolve(compressedBase64);
      } catch (err) {
        reject(new Error(`Compression failed: ${err.message}`));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = base64String;
  });
}

/**
 * Get image file size in bytes
 * @param {string} base64String - Base64 encoded image
 * @returns {number} File size in bytes
 */
export function getImageSize(base64String) {
  if (!base64String) return 0;
  
  // Remove data URL prefix if present
  const base64 = base64String.split(',')[1] || base64String;
  
  // Calculate size: (string length * 6) / 8
  return Math.ceil((base64.length * 6) / 8);
}

/**
 * Format bytes to human readable size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate image before compression
 * @param {File} file - Image file
 * @returns {{valid: boolean, message?: string}}
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, message: 'No file selected' };
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, message: 'Only JPEG, PNG, and WebP images allowed' };
  }

  if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
    return { 
      valid: false, 
      message: `Image must be smaller than ${formatFileSize(IMAGE_CONFIG.MAX_FILE_SIZE)}` 
    };
  }

  return { valid: true };
}

/**
 * Process image file: validate, compress, and return base64
 * @param {File} file - Image file
 * @returns {Promise<{base64: string, originalSize: number, compressedSize: number}>}
 */
export async function processImageFile(file) {
  // Validate
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  // Read file as base64
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

  const originalSize = file.size;

  // Compress
  const compressed = await compressImage(base64);
  const compressedSize = getImageSize(compressed);

  return {
    base64: compressed,
    originalSize,
    compressedSize,
    compressionRatio: Math.round((1 - compressedSize / originalSize) * 100),
  };
}
