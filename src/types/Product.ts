// Re-export types from database schema
export type { Product, NewProduct } from '../db/schema';

// Legacy interface for backward compatibility
export interface ProductFormData {
  name: string;
  description?: string;
  product_details?: string;
  price: number;
  images: string[];
  colors: Array<{
    name: string;
    value: string;
    image_index?: number;
  }>;
  sizes: string[];
  category: 'Dresses' | 'Tops' | 'Bottoms' | 'Accessories' | 'Sets';
}
