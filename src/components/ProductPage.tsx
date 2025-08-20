import React, { useState } from 'react';
import { Heart, Star, ChevronLeft, ChevronRight, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { Product } from '../types/Product';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import { useAuth } from '../context/AuthContext';

interface ProductPageProps {
  product: Product;
  onBack: () => void;
  onBuyNow: () => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ product, onBack, onBuyNow }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isProductDetailsExpanded, setIsProductDetailsExpanded] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  const { addToCart } = useCart();
  const { addToFavourites, removeFromFavourites, isFavourite } = useFavourites();
  const { user } = useAuth();

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    const selectedColor = product.colors[selectedColorIndex];
    addToCart(
      product,
      selectedColor.name,
      selectedSize,
      selectedColor.value,
      quantity
    );

    setShowAddedToCart(true);
    setTimeout(() => setShowAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    const selectedColor = product.colors[selectedColorIndex];
    addToCart(
      product,
      selectedColor.name,
      selectedSize,
      selectedColor.value,
      quantity
    );
    
    onBuyNow();
  };

  const handleFavouriteClick = async () => {
    if (!user) {
      alert('Please log in to add items to your favourites');
      return;
    }

    // Prevent duplicate clicks while request is pending
    if (loadingFavorite) {
      return;
    }

    try {
      setLoadingFavorite(true);
      
      if (isFavourite(product.id)) {
        await removeFromFavourites(product.id);
      } else {
        await addToFavourites(product);
      }
    } catch (error) {
      console.error('Error handling favourite:', error);
      alert('Failed to update favourites. Please try again.');
    } finally {
      setLoadingFavorite(false);
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6"
        >
          <ChevronLeft size={20} />
          Back to Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-auto object-contain"
              />
              
              {/* Navigation arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-black' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl font-semibold">£{product.price}</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">(4.8) 124 reviews</span>
                </div>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-medium mb-3">
                Color: {product.colors[selectedColorIndex].name}
              </h3>
              <div className="flex gap-3">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedColorIndex(index);
                      // If this color has a specific image mapped, switch to that image
                      if (color.imageIndex !== undefined && color.imageIndex < product.images.length) {
                        setSelectedImageIndex(color.imageIndex);
                      }
                    }}
                    className={`w-10 h-10 rounded-full border-2 ${
                      selectedColorIndex === index ? 'border-black' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-medium mb-3">Size</h3>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-3 border rounded-md text-center ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-medium mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Minus size={16} />
                </button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-6 border border-black text-black rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  {showAddedToCart ? 'Added to Cart!' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleFavouriteClick}
                  disabled={loadingFavorite}
                  className={`p-3 border rounded-md transition-colors ${
                    loadingFavorite
                      ? 'border-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                      : isFavourite(product.id) 
                        ? 'border-red-500 text-red-500 bg-red-50' 
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Heart size={20} className={loadingFavorite ? '' : isFavourite(product.id) ? 'fill-current' : ''} />
                </button>
              </div>
              
              <button
                onClick={handleBuyNow}
                className="w-full py-3 px-6 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
              >
                Buy Now
              </button>
            </div>

            {/* Description Dropdown */}
            <div className="border-t pt-6">
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-medium">Description</h3>
                {isDescriptionExpanded ? (
                  <ChevronUp size={20} className="text-gray-500" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500" />
                )}
              </button>
              {isDescriptionExpanded && (
                <div className="mt-4 text-gray-600">
                  {product.description ? (
                    <p className="whitespace-pre-line">{product.description}</p>
                  ) : (
                    <p>
                      Elegant and sophisticated, this piece combines timeless design with modern comfort. 
                      Perfect for special occasions or when you want to feel effortlessly chic.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Product Details Dropdown */}
            <div className="border-t pt-6">
              <button
                onClick={() => setIsProductDetailsExpanded(!isProductDetailsExpanded)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-medium">Product Details</h3>
                {isProductDetailsExpanded ? (
                  <ChevronUp size={20} className="text-gray-500" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500" />
                )}
              </button>
              {isProductDetailsExpanded && (
                <div className="mt-4 text-gray-600">
                  {(product as any).product_details ? (
                    <p className="whitespace-pre-line">{(product as any).product_details}</p>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span>{product.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Material:</span>
                        <span>Premium Cotton Blend</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Care:</span>
                        <span>Machine Wash Cold</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fit:</span>
                        <span>True to Size</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
