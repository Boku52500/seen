import React, { useState, useRef, useEffect } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types/Product';
import { productService } from '../services/productService';

interface ProductContainerProps {
  onProductSelect?: (product: Product) => void;
}

export default function ProductContainer({ onProductSelect }: ProductContainerProps) {
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();
  const { addToFavourites, removeFromFavourites, isFavourite } = useFavourites();
  const { user } = useAuth();
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<{ [key: string]: number }>({});
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const [loadingFavorites, setLoadingFavorites] = useState<{ [key: string]: boolean }>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleColorSelect = (productId: string, colorIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedColors(prev => ({ ...prev, [productId]: colorIndex }));
    
    // Find the product and get the color-specific image
    const product = products.find(p => p.id === productId);
    if (product && product.colors[colorIndex]) {
      // If the product has color-specific images, switch to that color's first image
      const imageIndex = Math.min(colorIndex, product.images.length - 1);
      setCurrentImageIndex(prev => ({ ...prev, [productId]: imageIndex }));
    }
  };

  const handleSizeSelect = (productId: string, size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
    
    // Automatically add to cart when size is selected
    const product = products.find(p => p.id === productId);
    if (product) {
      const selectedColorIndex = selectedColors[productId] || 0;
      const selectedColor = product.colors[selectedColorIndex];
      
      addToCart(
        product,
        selectedColor.name,
        size,
        selectedColor.value,
        1
      );
    }
  };

  const handleImageScroll = (productId: string, direction: 'next' | 'prev') => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCurrentImageIndex(prev => {
      const current = prev[productId] || 0;
      const maxIndex = product.images.length - 1;
      return { ...prev, [productId]: direction === 'next' ? (current >= maxIndex ? 0 : current + 1) : (current <= 0 ? maxIndex : current - 1) };
    });
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const selectedColorIndex = selectedColors[product.id] || 0;
    const selectedColor = product.colors[selectedColorIndex];
    const defaultSize = product.sizes[0];
    
    addToCart(
      product,
      selectedColor.name,
      defaultSize,
      selectedColor.value,
      1
    );
  };

  const handleFavouriteClick = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      alert('Please log in to add items to your favourites');
      return;
    }

    // Prevent duplicate clicks while request is pending
    if (loadingFavorites[product.id]) {
      return;
    }

    try {
      setLoadingFavorites(prev => ({ ...prev, [product.id]: true }));
      
      if (isFavourite(product.id)) {
        await removeFromFavourites(product.id);
      } else {
        await addToFavourites(product);
      }
    } catch (error) {
      console.error('Error handling favourite:', error);
      alert('Failed to update favourites. Please try again.');
    } finally {
      setLoadingFavorites(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const handleProductClick = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentSlide < displayProducts.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Navigation handlers
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // next/prev slide functions removed (unused)

  // Auto-scroll effect for mobile
  useEffect(() => {
    if (window.innerWidth < 768 && displayProducts.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => 
          prev >= Math.min(displayProducts.length, 4) - 1 ? 0 : prev + 1
        );
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [displayProducts.length]);

  // Load cached Discover products immediately to avoid empty flash
  useEffect(() => {
    try {
      const raw = localStorage.getItem('homeDiscoverCache');
      if (raw) {
        const cached: Product[] = JSON.parse(raw);
        if (Array.isArray(cached) && cached.length > 0) {
          setDisplayProducts(cached.slice(0, 4));
          setCurrentSlide(0);
        }
      }
    } catch {}
  }, []);

  // Fetch selected Discover products; show immediate fallback then swap in selection
  useEffect(() => {
    let isCancelled = false;
    const loadDiscover = async () => {
      try {
        // Immediate fallback to avoid empty state; do not overwrite if we already have cached content
        if (!isCancelled) {
          setDisplayProducts(prev => (prev && prev.length > 0) ? prev : products.slice(0, 4));
        }

        // Fetch only selection IDs (small, fast)
        const selectedIds = await productService.getHomeDiscoverSelection();

        if (!isCancelled) {
          if (selectedIds && selectedIds.length > 0) {
            // Build selection from already-fetched products to avoid extra network latency
            const ordered = selectedIds
              .map(id => products.find(p => p.id === id))
              .filter((p): p is Product => Boolean(p));

            // Only update if we actually found products; otherwise keep fallback
            if (ordered.length > 0) {
              setDisplayProducts(ordered.slice(0, 4));
              try { localStorage.setItem('homeDiscoverCache', JSON.stringify(ordered.slice(0, 4))); } catch {}
            } else {
              // If mapping fails (e.g., context not ready), fetch full product objects as a backup
              const selectedFull = await productService.getHomeDiscoverProducts();
              if (selectedFull && selectedFull.length > 0) {
                setDisplayProducts(selectedFull.slice(0, 4));
                try { localStorage.setItem('homeDiscoverCache', JSON.stringify(selectedFull.slice(0, 4))); } catch {}
              }
            }
          }
          setCurrentSlide(0);
        }
      } catch (e) {
        // Keep fallback silently on error
      }
    };
    loadDiscover();
    return () => { isCancelled = true; };
  }, [products]);

  // Skeleton card component for loading state
  const SkeletonCard = () => (
    <div className="group relative w-full">
      <div className="relative w-full overflow-hidden">
        <div className="w-full h-96 bg-gray-200"></div>
      </div>
      <div className="p-4 text-center">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-3"></div>
        <div className="flex justify-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gray-200"></div>
          <div className="w-6 h-6 rounded-full bg-gray-200"></div>
          <div className="w-6 h-6 rounded-full bg-gray-200"></div>
        </div>
      </div>
    </div>
  );

  const LoadingProductCard = ({ product }: { product: Product }) => {
    return (
      <div
        key={product.id}
        className="group relative cursor-pointer w-full"
        onMouseEnter={() => setHoveredProduct(product.id)}
        onMouseLeave={() => setHoveredProduct(null)}
        onClick={() => handleProductClick(product)}
      >
        <div className="relative w-full overflow-hidden">
          <img
            src={product.images[currentImageIndex[product.id] || 0]}
            alt={product.name}
            className="w-full h-auto md:object-cover object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Image Navigation Arrows */}
          {hoveredProduct === product.id && product.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageScroll(product.id, 'prev');
                }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageScroll(product.id, 'next');
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
              >
                ›
              </button>
            </>
          )}

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              className={`p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all ${
                loadingFavorites[product.id] ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={(e) => handleFavouriteClick(product, e)}
              disabled={loadingFavorites[product.id]}
            >
              <Heart 
                size={16} 
                className={`transition-colors ${
                  loadingFavorites[product.id]
                    ? 'text-gray-400'
                    : isFavourite(product.id) 
                      ? 'text-red-500 fill-red-500' 
                      : 'text-gray-600 hover:text-red-500'
                }`} 
              />
            </button>
            <button 
              className="p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all"
              onClick={(e) => handleAddToCart(product, e)}
              title="Add to Cart"
            >
              <ShoppingBag size={16} className="text-gray-600 hover:text-black" />
            </button>
          </div>

          {/* Sizes overlay */}
          <div className={`absolute bottom-0 left-0 right-0 bg-white bg-opacity-95 p-4 transition-all duration-300 ${
            hoveredProduct === product.id ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}>
            <div className="flex justify-center flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={(e) => handleSizeSelect(product.id, size, e)}
                  className={`px-3 py-2 text-sm border border-gray-400 hover:border-black transition-all duration-200 ${
                    selectedSizes[product.id] === size ? 'border-black bg-black text-white' : 'bg-white text-gray-800'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 text-center">
          <h3 className="text-base font-semibold text-gray-900">{product.name}</h3>
          <p className="text-base text-gray-700 mt-1">£{product.price}</p>

          {/* Colors */}
          <div className="flex justify-center space-x-2 mt-3">
            {product.colors.map((color, index) => (
              <button
                key={index}
                onClick={(e) => handleColorSelect(product.id, index, e)}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                  (selectedColors[product.id] || 0) === index
                    ? 'border-black scale-110'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white w-full">
        <div className="flex justify-center py-8 border-b border-gray-200">
          <h1 className="text-4xl font-bold uppercase tracking-wide">Discover</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white w-full">
        <div className="flex justify-center py-8 border-b border-gray-200">
          <h1 className="text-4xl font-bold uppercase tracking-wide">Discover</h1>
        </div>
        <div className="flex justify-center items-center py-16">
          <div className="text-lg text-red-500">Error loading products: {error}</div>
        </div>
      </div>
    );
  }

  // Show skeletons while both product list and display list are empty
  if ((!products || products.length === 0) && displayProducts.length === 0) {
    return (
      <div className="bg-white w-full">
        <div className="flex justify-center py-8 border-b border-gray-200">
          <h1 className="text-4xl font-bold uppercase tracking-wide">Discover</h1>
        </div>
        <div className="py-8 px-4">
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="md:hidden">
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // displayProducts is derived from admin selection or fallback above



  return (
    <div className="bg-white w-full">
      {/* Discover Text Header */}
      <div className="flex justify-center py-8 border-b border-gray-200">
        <h1 className="text-4xl font-bold uppercase tracking-wide">Discover</h1>
      </div>

      {/* Mobile Slider / Desktop Grid */}
      <div className="relative w-full">
        {/* Mobile Slider */}
        <div className="md:hidden">
          <div 
            ref={sliderRef}
            className="relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {displayProducts.map((product) => (
                <div key={product.id} className="w-full flex-shrink-0">
                  <LoadingProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
          
          {/* Mobile Navigation Dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {displayProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  currentSlide === index ? 'bg-black' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          
        </div>
        
        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 w-full">
          {displayProducts.map((product) => (
            <LoadingProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
