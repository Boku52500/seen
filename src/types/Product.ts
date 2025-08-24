// Re-export types from database schema
export type { Product, NewProduct } from '../db/schema';

// Legacy interface for backward compatibility
export interface ProductFormData {
  name: string;
  description?: string;
  product_details?: string;
  size_chart?: string[][];
  price: number;
  images: string[];
  colors: Array<{
    name: string;
    value: string;
    imageIndex?: number;
  }>;
  sizes: string[];
  category: 'Dresses' | 'Tops' | 'Bottoms' | 'Accessories' | 'Sets';
}
