import { type Product, type NewProduct } from '../db';

const API_BASE_URL = '/api';

export const productService = {
  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const products = await response.json();
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return []; // Return empty array instead of throwing error
    }
  },

  // Get product by ID
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const product = await response.json();
      return product;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null; // Return null instead of throwing error
    }
  },

  // Add a new product
  addProduct: async (productData: Omit<NewProduct, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
    try {
      console.log('Adding product with data:', productData);
      console.log('API URL:', `${API_BASE_URL}/products`);
      
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Success result:', result);
      return result.id;
    } catch (error) {
      console.error('Error adding product:', error);
      if (error instanceof Error) {
        throw error; // Re-throw the original error with details
      } else {
        throw new Error('Failed to add product: Unknown error');
      }
    }
  },

  // Update an existing product
  updateProduct: async (id: string, productData: Partial<Omit<NewProduct, 'id' | 'created_at'>>): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  },

  // Delete a product (soft delete)
  deleteProduct: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  },

  // Search products
  searchProducts: async (searchTerm: string): Promise<Product[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/search/${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const products = await response.json();
      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      return []; // Return empty array instead of throwing error
    }
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/category/${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const products = await response.json();
      return products;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return []; // Return empty array instead of throwing error
    }
  },

  // Get featured products (you can customize this logic)
  getFeaturedProducts: async (limit: number = 8): Promise<Product[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const products = await response.json();
      return products.slice(0, limit); // Ensure we don't exceed the limit
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return []; // Return empty array instead of throwing error
    }
  },

  // Home Discover selection: get selected product IDs (ordered)
  getHomeDiscoverSelection: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/home-discover`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rows: Array<{ product_id: string; position: number }> = await response.json();
      return rows
        .sort((a, b) => a.position - b.position)
        .map((r) => r.product_id);
    } catch (error) {
      console.error('Error fetching home discover selection:', error);
      return [];
    }
  },

  // Home Discover: update selection (overwrite existing)
  updateHomeDiscoverSelection: async (productIds: string[]): Promise<{ ok: boolean; status: number; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/home-discover`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds }),
      });
      if (!response.ok) {
        const raw = await response.text();
        let msg = raw;
        try {
          const parsed = JSON.parse(raw);
          msg = parsed.error || raw;
        } catch {}
        return { ok: false, status: response.status, error: msg };
      }
      return { ok: true, status: response.status };
    } catch (error) {
      console.error('Error updating home discover selection:', error);
      return { ok: false, status: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Home Discover: get selected products (full objects) in order
  getHomeDiscoverProducts: async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/home-discover/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const products = await response.json();
      return products;
    } catch (error) {
      console.error('Error fetching home discover products:', error);
      return [];
    }
  },
};
