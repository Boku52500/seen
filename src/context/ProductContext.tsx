import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/Product';
import { productService } from '../services/productService';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Fetch products from database via API
    productService.getAllProducts()
      .then((dbProducts) => {
        setProducts(dbProducts);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please check if the server is running.');
        setProducts([]);
        setLoading(false);
      });
  }, []);

  const refreshProducts = () => {
    setLoading(true);
    setError(null);

    productService.getAllProducts()
      .then((dbProducts) => {
        setProducts(dbProducts);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error refreshing products:', err);
        setError('Failed to refresh products. Please check if the server is running.');
        setProducts([]);
        setLoading(false);
      });
  };

  const value = {
    products,
    loading,
    error,
    refreshProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
