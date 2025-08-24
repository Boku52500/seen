// Image storage service for PostgreSQL-based e-commerce app
// For production, you would typically use a cloud storage service like AWS S3, Cloudinary, or similar
// For now, we'll use base64 encoding to store images directly in the database

export const storageService = {
  // Convert image file to base64 data URL for storage
  uploadImage: async (file: File, path: string): Promise<string> => {
    try {
      console.log('StorageService: Converting image to base64 for file:', file.name);
      // Mark 'path' as intentionally unused for now (reserved for future storage backends)
      void path;
      
      // Validate file size (max 5MB for base64 storage)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Image file too large. Please use an image smaller than 5MB.');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please use JPEG, PNG, WebP, or AVIF images.');
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          console.log('StorageService: Image converted to base64 successfully');
          resolve(base64String);
        };
        
        reader.onerror = (error) => {
          console.error('StorageService: Error reading file:', error);
          reject(new Error('Failed to read image file'));
        };
        
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('StorageService: Error processing image:', error);
      throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // For base64 storage, deletion is handled by removing from database
  deleteImage: async (imagePath: string): Promise<void> => {
    try {
      console.log('StorageService: Image deletion handled by database removal for path:', imagePath);
      // No action needed for base64 - deletion handled by database
    } catch (error) {
      console.error('Error in deleteImage:', error);
      // Don't throw error for delete failures
    }
  },

  // Generate unique identifier for image
  generateImagePath: (productId: string, imageIndex: number, file: File): string => {
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    return `${productId}_${timestamp}_${imageIndex}.${extension}`;
  },

  // Validate image file before upload
  validateImage: (file: File): { valid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];

    if (file.size > maxSize) {
      return { valid: false, error: 'Image file too large. Please use an image smaller than 5MB.' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Please use JPEG, PNG, WebP, or AVIF images.' };
    }

    return { valid: true };
  }
};
