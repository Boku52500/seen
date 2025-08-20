import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SlidersHorizontal, ChevronRight, Heart, LayoutGrid, Grid3X3 } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useFavourites } from '../context/FavouritesContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types/Product';
import { SortMenu } from './SortMenu';
import { MobileFiltersDrawer } from './MobileFiltersDrawer';

type SortOption = 'best-selling' | 'price-low-high' | 'price-high-low' | 'name-a-z' | 'name-z-a' | 'newest';

interface ShopProps {
  onProductSelect: (product: Product) => void;
  categoryFilter?: string;
}

export const Shop: React.FC<ShopProps> = ({ onProductSelect, categoryFilter }) => {
  const { products: allProducts, loading, error } = useProducts();
  const { favourites, addToFavourites, removeFromFavourites, loading: favouritesLoading } = useFavourites();
  const { user } = useAuth();

  const [sortBy, setSortBy] = useState<SortOption>('best-selling');
  const [showFilters, setShowFilters] = useState(false); // controls mobile sheet + (now) desktop collapse
  const [viewMode, setViewMode] = useState<'grid-4' | 'grid-3' | 'list'>('grid-4');
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  // Helper function to get sort label
  const getSortLabel = (sortOption: SortOption): string => {
    switch (sortOption) {
      case 'best-selling': return 'BEST SELLING';
      case 'price-low-high': return 'PRICE: LOW TO HIGH';
      case 'price-high-low': return 'PRICE: HIGH TO LOW';
      case 'name-a-z': return 'NAME: A TO Z';
      case 'name-z-a': return 'NAME: Z TO A';
      case 'newest': return 'NEWEST FIRST';
      default: return 'BEST SELLING';
    }
  };

  const [expandedFilters, setExpandedFilters] = useState({
    products: false,
    colour: false,
    price: false,
    size: false
  });

  // Price range from products
  const minPrice = useMemo(() => allProducts.length ? Math.min(...allProducts.map(p => p.price)) : 0, [allProducts]);
  const maxPrice = useMemo(() => allProducts.length ? Math.max(...allProducts.map(p => p.price)) : 1000, [allProducts]);

  const [selectedFilters, setSelectedFilters] = useState({
    categories: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    priceRange: null as [number, number] | null // No price filter by default
  });

  const toggleFilter = (key: keyof typeof expandedFilters) =>
    setExpandedFilters(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleCategoryFilter = (category: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleColorFilter = (color: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const toggleSizeFilter = (size: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const updatePriceRange = (min: number, max: number) => {
    const clampedMin = Math.max(minPrice, Math.min(min, max));
    const clampedMax = Math.min(maxPrice, Math.max(max, min));
    setSelectedFilters(prev => ({ ...prev, priceRange: [clampedMin, clampedMax] }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      categories: [],
      colors: [],
      sizes: [],
      priceRange: null
    });
  };

  const removeFilter = (type: 'category'|'color'|'size', value: string) => {
    if (type === 'category') toggleCategoryFilter(value);
    if (type === 'color') toggleColorFilter(value);
    if (type === 'size') toggleSizeFilter(value);
  };

  const hasActiveFilters = selectedFilters.categories.length > 0 ||
                           selectedFilters.colors.length > 0 ||
                           selectedFilters.sizes.length > 0 ||
                           (selectedFilters.priceRange !== null);

  // Filter + sort
  const filteredProducts = useMemo(() => {
    const filtered = allProducts.filter(product => {
      if (categoryFilter && product.category !== categoryFilter) return false;

      if (selectedFilters.categories.length &&
          !selectedFilters.categories.includes(product.category)) return false;

      if (selectedFilters.colors.length) {
        const productColors = product.colors.map(c => c.name.toLowerCase());
        const match = selectedFilters.colors.some(c => productColors.includes(c.toLowerCase()));
        if (!match) return false;
      }

      if (selectedFilters.sizes.length) {
        const match = selectedFilters.sizes.some(s => product.sizes.includes(s));
        if (!match) return false;
      }

      // Only apply price filter if it's been set
      if (selectedFilters.priceRange !== null) {
        const [minR, maxR] = selectedFilters.priceRange;
        if (product.price < minR || product.price > maxR) return false;
      }

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low-high': return a.price - b.price;
        case 'price-high-low': return b.price - a.price;
        case 'name-a-z': return a.name.localeCompare(b.name);
        case 'name-z-a': return b.name.localeCompare(a.name);
        case 'newest': return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        case 'best-selling':
        default: return 0;
      }
    });

    return sorted;
  }, [allProducts, selectedFilters, sortBy, categoryFilter]);

  // Unique filter values
  const availableCategories = useMemo(
    () => Array.from(new Set(allProducts.map(p => p.category))).sort(),
    [allProducts]
  );

  const availableColors = useMemo(() => {
    const map = new Map<string, string>();
    allProducts.forEach(p => p.colors.forEach(c => map.set(c.name, c.value)));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name));
  }, [allProducts]);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    allProducts.forEach(p => p.sizes.forEach(s => sizes.add(s)));
    return Array.from(sizes).sort();
  }, [allProducts]);

  // UI subcomponents
  const FilterSection = ({ title, isExpanded, onToggle, children }: {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-black py-2">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left text-base font-medium text-black hover:opacity-80 transition-opacity"
        aria-expanded={isExpanded}
      >
        <span>{title}</span>
        <span>{isExpanded ? <ChevronRight className="w-5 h-5 rotate-90" /> : <ChevronRight className="w-5 h-5" />}</span>
      </button>
      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="mt-2">{children}</div>
        </div>
      </div>
    </div>
  );

  const ProductCard = ({ product }: { product: Product }) => {
    const isFavourite = favourites.some((f: any) => f.productId === product.id);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFavouriteClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user) return alert('Please log in to add items to your favourites');
      if (isProcessing || favouritesLoading) return;

      setIsProcessing(true);
      try {
        if (isFavourite) await removeFromFavourites(product.id);
        else await addToFavourites(product);
      } catch (err) {
        console.error(err);
        alert('Failed to update favourites. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <div
        key={product.id}
        className="group relative bg-white cursor-pointer rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors"
        onClick={() => onProductSelect?.(product)}
      >
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={product.images[0] || '/assets/placeholder.jpg'}
            alt={product.name}
            loading="lazy"
            className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <button
            aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
            className={`absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow-sm transition 
              ${isProcessing || favouritesLoading ? 'cursor-not-allowed opacity-60' : 'hover:scale-105'}`}
            onClick={handleFavouriteClick}
            disabled={isProcessing || favouritesLoading}
          >
            <Heart className={`w-4 h-4 transition-colors ${isFavourite ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
          </button>
        </div>
        <div className="p-3">
          <h3 className="text-sm sm:text-base font-medium text-black line-clamp-2">{product.name}</h3>
          <p className="mt-1 text-sm sm:text-base text-black">£{product.price}</p>
        </div>
      </div>
    );
  };

  const SkeletonCard = () => (
    <div className="animate-pulse rounded-2xl border border-gray-200">
      <div className="h-64 bg-gray-100 rounded-t-2xl" />
      <div className="p-3">
        <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Title */}
      <div className="w-full flex flex-col items-center justify-center py-10 bg-white">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 text-center tracking-tight">
          {categoryFilter || 'Shop'}
        </h1>
        <p className="text-base text-gray-600 text-center">Always — Be Seen</p>
      </div>

      {/* Toolbar */}
      <div className="border border-black bg-white mx-4 sm:mx-6 lg:mx-8 rounded-xl">
        <div className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Filters toggle (visible on mobile & tablet) */}
            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 text-sm sm:text-base text-black hover:opacity-80 border border-black px-3 py-2 rounded-lg justify-center lg:hidden"
              aria-expanded={showFilters}
              aria-controls="filters-drawer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>FILTERS</span>
            </button>

            {/* On desktop we still show a collapse button for convenience */}
            {/* Desktop collapse button */}
{/* Desktop collapse button */}
<button
  type="button"
  onClick={(e) => {
    e.preventDefault();
    setShowFilters(prev => !prev);
  }}
  className="hidden lg:flex items-center gap-2 text-sm text-black hover:text-black border border-black px-3 py-2 rounded-lg h-[40px] transition-colors"
  aria-expanded={showFilters}
  aria-controls="filters-panel"
  title={showFilters ? 'Hide filters' : 'Show filters'}
>
  <SlidersHorizontal className="w-4 h-4 shrink-0" />
  <span className="truncate">{showFilters ? 'HIDE FILTERS' : 'SHOW FILTERS'}</span>
</button>

{/* Sort */}
<div className="flex-1 sm:flex-none">
  <SortMenu
    currentSort={sortBy}
    onSortChange={(value) => setSortBy(value as SortOption)}
    getSortLabel={getSortLabel}
    className="h-[40px]" // ensures same height
  />
</div>


          </div>

          {/* View modes */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid-4')}
              className={`p-2 border border-black rounded-lg transition ${viewMode === 'grid-4' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
              title="4 per row"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid-3')}
              className={`p-2 border border-black rounded-lg transition ${viewMode === 'grid-3' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
              title="3 per row"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-black">Active Filters</h3>
            <button onClick={clearAllFilters} className="text-sm text-red-600 hover:text-red-700 underline">
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedFilters.categories.map(category => (
              <span key={category} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-black text-white">
                {category}
                <button onClick={() => removeFilter('category', category)} className="ml-2 text-white/80 hover:text-white" aria-label={`Remove ${category}`}>×</button>
              </span>
            ))}
            {selectedFilters.colors.map(color => (
              <span key={color} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-black text-white">
                {color}
                <button onClick={() => removeFilter('color', color)} className="ml-2 text-white/80 hover:text-white" aria-label={`Remove ${color}`}>×</button>
              </span>
            ))}
            {selectedFilters.sizes.map(size => (
              <span key={size} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-black text-white">
                {size}
                <button onClick={() => removeFilter('size', size)} className="ml-2 text-white/80 hover:text-white" aria-label={`Remove ${size}`}>×</button>
              </span>
            ))}
            {/* Price chip (only if set) */}
            {selectedFilters.priceRange && (() => {
              const range = selectedFilters.priceRange!;
              return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-black text-white">
                  £{range[0]}–£{range[1]}
                  <button onClick={() => setSelectedFilters(prev => ({ ...prev, priceRange: null }))} className="ml-2 text-white/80 hover:text-white" aria-label="Reset price">×</button>
                </span>
              );
            })()}
          </div>
        </div>
      )}

      {/* Mobile Filters Drawer */}
      <MobileFiltersDrawer 
        showFilters={showFilters && isMobile} 
        onClose={() => setShowFilters(false)}
      >
        <div className="space-y-6">
            <FilterSection
              title="PRODUCTS"
              isExpanded={expandedFilters.products}
              onToggle={() => toggleFilter('products')}
            >
              <div className="flex flex-col divide-y divide-black/20">
                {availableCategories.map(category => (
                  <label key={category} className="flex items-center text-black text-base py-2">
                    <input
                      type="checkbox"
                      checked={selectedFilters.categories.includes(category)}
                      onChange={() => toggleCategoryFilter(category)}
                      className="mr-3 h-4 w-4 text-black border-black rounded focus:ring-black"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection
              title="COLOUR"
              isExpanded={expandedFilters.colour}
              onToggle={() => toggleFilter('colour')}
            >
              <div className="flex flex-col gap-2">
                {availableColors.map(color => (
                  <label key={color.name} className="flex items-center text-black text-base">
                    <input
                      type="checkbox"
                      className="rounded border-black text-black focus:ring-black mr-3"
                      checked={selectedFilters.colors.includes(color.name)}
                      onChange={() => toggleColorFilter(color.name)}
                    />
                    <span className="flex items-center">
                      <span
                        className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.name}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection
              title="PRICE"
              isExpanded={expandedFilters.price}
              onToggle={() => toggleFilter('price')}
            >
              <div className="space-y-4">
                {/* Track */}
                <div className="px-4">
                  <div className="relative h-6 flex items-center">
                    <div className="w-full h-2 bg-gray-200 rounded-full relative">
                      {/* Active range */}
                      <div
                        className="absolute h-2 bg-black rounded-full"
                        style={{
                          left: `${((selectedFilters.priceRange ? selectedFilters.priceRange[0] - minPrice : 0) / (maxPrice - minPrice || 1)) * 100}%`,
                          width: `${((selectedFilters.priceRange ? (selectedFilters.priceRange[1] - selectedFilters.priceRange[0]) : (maxPrice - minPrice)) / (maxPrice - minPrice || 1)) * 100}%`
                        }}
                      />
                      {/* Min thumb */}
                      <Thumb
                        positionPct={((selectedFilters.priceRange ? selectedFilters.priceRange[0] - minPrice : 0) / (maxPrice - minPrice || 1)) * 100}
                        onDrag={(pct) => {
                          const val = Math.round(minPrice + (pct / 100) * (maxPrice - minPrice));
                          updatePriceRange(val, selectedFilters.priceRange ? selectedFilters.priceRange[1] : maxPrice);
                        }}
                      />
                      {/* Max thumb */}
                      <Thumb
                        positionPct={((selectedFilters.priceRange ? selectedFilters.priceRange[1] - minPrice : maxPrice - minPrice) / (maxPrice - minPrice || 1)) * 100}
                        onDrag={(pct) => {
                          const val = Math.round(minPrice + (pct / 100) * (maxPrice - minPrice));
                          updatePriceRange(selectedFilters.priceRange ? selectedFilters.priceRange[0] : minPrice, val);
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Price numbers */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Min</span>
                    <span className="text-sm font-medium text-black">£{selectedFilters.priceRange ? selectedFilters.priceRange[0] : minPrice}</span>
                  </div>
                  <div className="w-8 h-px bg-gray-300" />
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-gray-500 mb-1">Max</span>
                    <span className="text-sm font-medium text-black">£{selectedFilters.priceRange ? selectedFilters.priceRange[1] : maxPrice}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-400 text-center">
                  Range: £{minPrice} – £{maxPrice}
                </div>
              </div>
            </FilterSection>

            <FilterSection
              title="SIZE"
              isExpanded={expandedFilters.size}
              onToggle={() => toggleFilter('size')}
            >
              <div className="grid grid-cols-3 gap-2">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => toggleSizeFilter(size)}
                    className={`border text-base py-1.5 px-2 rounded-md transition
                      ${selectedFilters.sizes.includes(size)
                        ? 'border-black bg-black text-white'
                        : 'border-black hover:bg-gray-50'}`}
                    aria-pressed={selectedFilters.sizes.includes(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </FilterSection>
        </div>
      </MobileFiltersDrawer>

      <div className={`flex gap-0 mx-0 lg:mx-8 ${showFilters ? 'lg:gap-6' : 'lg:gap-0'}`}>
        {/* Desktop Filters Sidebar */}
        <aside
  className={`
    hidden lg:block lg:rounded-xl lg:border lg:border-black lg:overflow-y-auto
    lg:max-h-[calc(100vh-200px)]
    transition-all duration-300 ease-in-out transform origin-left overflow-hidden
    ${showFilters
      ? 'lg:opacity-100 lg:translate-x-0 lg:w-80 lg:my-6 lg:p-6'
      : 'lg:opacity-0 lg:-translate-x-4 lg:w-0 lg:p-0 lg:border-0 lg:my-0'}
  `}
>

          <div className="space-y-6">
            <FilterSection
              title="PRODUCTS"
              isExpanded={expandedFilters.products}
              onToggle={() => toggleFilter('products')}
            >
              <div className="flex flex-col divide-y divide-black/20">
                {availableCategories.map(category => (
                  <label key={category} className="flex items-center text-black text-base py-2">
                    <input
                      type="checkbox"
                      checked={selectedFilters.categories.includes(category)}
                      onChange={() => toggleCategoryFilter(category)}
                      className="mr-3 h-4 w-4 text-black border-black rounded focus:ring-black"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection
              title="COLOUR"
              isExpanded={expandedFilters.colour}
              onToggle={() => toggleFilter('colour')}
            >
              <div className="flex flex-col gap-2">
                {availableColors.map(color => (
                  <label key={color.name} className="flex items-center text-black text-base">
                    <input
                      type="checkbox"
                      className="rounded border-black text-black focus:ring-black mr-3"
                      checked={selectedFilters.colors.includes(color.name)}
                      onChange={() => toggleColorFilter(color.name)}
                    />
                    <span className="flex items-center">
                      <span
                        className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.name}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection
              title="PRICE"
              isExpanded={expandedFilters.price}
              onToggle={() => toggleFilter('price')}
            >
              <div className="space-y-4">
                {/* Track */}
                <div className="px-4">
                  <div className="relative h-6 flex items-center">
                    <div className="w-full h-2 bg-gray-200 rounded-full relative">
                      {/* Active range */}
                      <div
                        className="absolute h-2 bg-black rounded-full"
                        style={{
                          left: `${((selectedFilters.priceRange ? selectedFilters.priceRange[0] - minPrice : 0) / (maxPrice - minPrice || 1)) * 100}%`,
                          width: `${((selectedFilters.priceRange ? (selectedFilters.priceRange[1] - selectedFilters.priceRange[0]) : (maxPrice - minPrice)) / (maxPrice - minPrice || 1)) * 100}%`
                        }}
                      />
                      {/* Min thumb */}
                      <Thumb
                        positionPct={((selectedFilters.priceRange ? selectedFilters.priceRange[0] - minPrice : 0) / (maxPrice - minPrice || 1)) * 100}
                        onDrag={(pct) => {
                          const val = Math.round(minPrice + (pct / 100) * (maxPrice - minPrice));
                          updatePriceRange(val, selectedFilters.priceRange ? selectedFilters.priceRange[1] : maxPrice);
                        }}
                      />
                      {/* Max thumb */}
                      <Thumb
                        positionPct={((selectedFilters.priceRange ? selectedFilters.priceRange[1] - minPrice : maxPrice - minPrice) / (maxPrice - minPrice || 1)) * 100}
                        onDrag={(pct) => {
                          const val = Math.round(minPrice + (pct / 100) * (maxPrice - minPrice));
                          updatePriceRange(selectedFilters.priceRange ? selectedFilters.priceRange[0] : minPrice, val);
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Price numbers */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Min</span>
                    <span className="text-sm font-medium text-black">£{selectedFilters.priceRange ? selectedFilters.priceRange[0] : minPrice}</span>
                  </div>
                  <div className="w-8 h-px bg-gray-300" />
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-gray-500 mb-1">Max</span>
                    <span className="text-sm font-medium text-black">£{selectedFilters.priceRange ? selectedFilters.priceRange[1] : maxPrice}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-400 text-center">
                  Range: £{minPrice} – £{maxPrice}
                </div>
              </div>
            </FilterSection>

            <FilterSection
              title="SIZE"
              isExpanded={expandedFilters.size}
              onToggle={() => toggleFilter('size')}
            >
              <div className="grid grid-cols-3 gap-2">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => toggleSizeFilter(size)}
                    className={`border text-base py-1.5 px-2 rounded-md transition
                      ${selectedFilters.sizes.includes(size)
                        ? 'border-black bg-black text-white'
                        : 'border-black hover:bg-gray-50'}`}
                    aria-pressed={selectedFilters.sizes.includes(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </FilterSection>
          </div>
        </aside>

        {/* Products */}
        <main className="flex-1 p-4 sm:p-6 lg:p-0">

          {loading ? (
            <div className={`grid ${viewMode === 'grid-4'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : viewMode === 'grid-3'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'grid-cols-1 gap-4'
            } p-4 lg:p-6`}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className={`grid ${viewMode === 'grid-4'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : viewMode === 'grid-3'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'grid-cols-1 gap-4'
            } p-4 lg:p-6`}>
              {filteredProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// ---- Small thumb component with mouse + touch drag support ----
function Thumb({ positionPct, onDrag }: { positionPct: number; onDrag: (pct: number) => void; }) {
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const track = (e.currentTarget.parentElement as HTMLElement);
    const rect = track.getBoundingClientRect();

    const move = (clientX: number) => {
      const pct = ((clientX - rect.left) / rect.width) * 100;
      onDrag(Math.max(0, Math.min(100, pct)));
    };

    const onMouseMove = (me: MouseEvent) => move(me.clientX);
    const onTouchMove = (te: TouchEvent) => move(te.touches[0].clientX);

    const stop = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', stop);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', stop);
    };

    if ('clientX' in e) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', stop);
    } else {
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', stop);
    }
  };

  return (
    <div
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(positionPct)}
      className="absolute w-5 h-5 bg-white border-2 border-black rounded-full cursor-grab active:cursor-grabbing transform -translate-y-1/2 top-1/2 touch-none"
      style={{ left: `calc(${positionPct}% - 10px)` }}
      onMouseDown={handlePointerDown as any}
      onTouchStart={handlePointerDown as any}
    />
  );
}

export default Shop;
