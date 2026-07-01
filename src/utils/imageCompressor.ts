/**
 * Utility to compress base64 images client-side before sending to server.
 * This prevents PHP post_max_size / payload-too-large errors when saving projects.
 */
export interface CompressedImageResult {
  imageUrl: string;
  width: number;
  height: number;
}

export function compressImage(
  base64Str: string,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.7
): Promise<CompressedImageResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions to fit within maxWidth/maxHeight constraints
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);
        // Export to JPEG with quality parameter
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve({
          imageUrl: compressedBase64,
          width,
          height,
        });
      } else {
        resolve({
          imageUrl: base64Str,
          width: img.width,
          height: img.height,
        });
      }
    };
    img.onerror = () => {
      resolve({
        imageUrl: base64Str,
        width: 140, // fallback defaults
        height: 175,
      });
    };
  });
}
