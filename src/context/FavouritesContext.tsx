import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface FavouriteItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  productCategory: string;
  addedAt: Date;
}

interface FavouritesContextType {
  favourites: FavouriteItem[];
  loading: boolean;
  addToFavourites: (product: any) => Promise<void>;
  removeFromFavourites: (productId: string) => Promise<void>;
  isFavourite: (productId: string) => boolean;
  getFavouritesCount: () => number;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (context === undefined) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
};

interface FavouritesProviderProps {
  children: ReactNode;
}

export const FavouritesProvider: React.FC<FavouritesProviderProps> = ({ children }) => {
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load favourites when user changes
  useEffect(() => {
    if (user) {
      loadFavourites();
    } else {
      // Clear favourites when user logs out
      setFavourites([]);
    }
  }, [user]);

  const loadFavourites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No authentication token found for loading favourites');
        return;
      }

      const response = await fetch('/api/favourites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavourites(data);
      } else {
        console.error('Failed to load favourites:', response.status);
      }
    } catch (error) {
      console.error('Error loading favourites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavourites = async (product: any) => {
    if (!user) {
      throw new Error('User must be logged in to add favourites');
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/favourites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to favourites');
      }

      // Refresh favourites list
      await loadFavourites();
    } catch (error) {
      console.error('Error adding to favourites:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavourites = async (productId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/favourites/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove from favourites');
      }

      // Refresh favourites list
      await loadFavourites();
    } catch (error) {
      console.error('Error removing from favourites:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isFavourite = (productId: string): boolean => {
    return favourites.some(fav => fav.productId === productId);
  };

  const getFavouritesCount = (): number => {
    return favourites.length;
  };

  const value: FavouritesContextType = {
    favourites,
    loading,
    addToFavourites,
    removeFromFavourites,
    isFavourite,
    getFavouritesCount,
  };

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
};
