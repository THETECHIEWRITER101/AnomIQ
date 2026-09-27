/**
 * Compresses an image file on the frontend using HTML5 Canvas API to WebP format.
 * Target: Max width/height 1280x720, quality 0.75.
 * Prevents inflating PostgreSQL with large Base64 strings, keeping storage well within 500 MB Supabase free tier.
 */
export const compressImageToWebP = (
  file: File,
  maxWidth: number = 1280,
  maxHeight: number = 720,
  quality: number = 0.75
): Promise<{ blob: Blob; dataUrl: string; sizeReductionRatio: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio within bounding box
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // Draw and compress image to WebP
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('WebP compression failed'));
              return;
            }
            const dataUrl = canvas.toDataURL('image/webp', quality);
            const sizeReductionRatio = Math.round((1 - blob.size / file.size) * 100);
            resolve({ blob, dataUrl, sizeReductionRatio });
          },
          'image/webp',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
