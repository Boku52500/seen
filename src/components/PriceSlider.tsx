import React, { useState, useMemo, useEffect } from "react";
import { Slider } from "./ui/slider";
import { cn } from "../lib/utils";

interface PriceSliderProps {
  products: Array<{ price: number }>;
  onPriceChange?: (priceRange: [number, number]) => void;
  className?: string;
}

export function PriceSlider({ products, onPriceChange, className }: PriceSliderProps) {
  // Calculate price range from products
  const priceRange = useMemo(() => {
    if (products.length === 0) return [0, 1000] as [number, number];
    const prices = products.map(p => p.price);
    const range: [number, number] = [
      Math.floor(Math.min(...prices)), 
      Math.ceil(Math.max(...prices))
    ];
    return range;
  }, [products]);

  // State for immediate UI feedback (temp values)
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>(priceRange);

  // Initialize temp price range when products load
  useEffect(() => {
    setTempPriceRange(priceRange);
  }, [priceRange]);

  // Update filter function
  const updateFilter = (value: [number, number]) => {
    onPriceChange?.(value);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="bg-white rounded-lg p-4 space-y-4">
        <Slider
          value={tempPriceRange}
          onValueChange={(value) => setTempPriceRange(value as [number, number])}
          onValueCommit={(value) => updateFilter(value as [number, number])}
          max={priceRange[1]}
          min={priceRange[0]}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Min</span>
            <span className="text-sm font-medium text-black">£{tempPriceRange[0]}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs text-gray-500 mb-1">Max</span>
            <span className="text-sm font-medium text-black">£{tempPriceRange[1]}</span>
          </div>
        </div>
        <div className="text-xs text-gray-400 text-center">
          Range: £{priceRange[0]} - £{priceRange[1]}
        </div>
      </div>
    </div>
  );
}
