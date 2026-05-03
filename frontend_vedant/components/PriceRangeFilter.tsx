"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface PriceRangeFilterProps {
  initialMin?: number;
  initialMax?: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
}

export const PriceRangeFilter = ({ 
  initialMin = 100, 
  initialMax = 2000, 
  maxPrice,
  onPriceChange 
}: PriceRangeFilterProps) => {
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);
  const isInitialMount = useRef(true);
  const hasChanged = useRef(false);

  // Memoize the callback to prevent re-renders
  const stableOnPriceChange = useCallback(onPriceChange, []);

  // Sync with prop changes (for clear filters)
  useEffect(() => {
    if (!hasChanged.current) {
      setMin(initialMin);
      setMax(initialMax);
    }
  }, [initialMin, initialMax]);

  const debouncedMin = useDebounce(min, 300);
  const debouncedMax = useDebounce(max, 300);

  useEffect(() => {
    // Skip initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only call if values actually changed
    if (hasChanged.current && (debouncedMin !== initialMin || debouncedMax !== initialMax)) {
      stableOnPriceChange(debouncedMin, debouncedMax);
    }
    
    // Reset change flag after handling
    hasChanged.current = false;
  }, [debouncedMin, debouncedMax, stableOnPriceChange, initialMin, initialMax]);

  const handleSliderChange = useCallback((values: number[]) => {
    const [newMin, newMax] = values;
    if (newMin !== min || newMax !== max) {
      hasChanged.current = true;
      setMin(newMin);
      setMax(newMax);
    }
  }, [min, max]);

  const handleMinInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Number(e.target.value));
    if (value < max && value !== min) {
      hasChanged.current = true;
      setMin(value);
    }
  }, [min, max]);

  const handleMaxInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(maxPrice, Number(e.target.value));
    if (value > min && value !== max) {
      hasChanged.current = true;
      setMax(value);
    }
  }, [min, max, maxPrice]);

  return (
    <div className="space-y-4">
      <div className="px-2">
        <Slider
          value={[min, max]}
          onValueChange={handleSliderChange}
          max={maxPrice}
          min={0}
          step={50}
          className="w-full"
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm text-gray-500 font-medium">₹</span>
          <Input 
            type="number" 
            value={min} 
            onChange={handleMinInputChange}
            min={0}
            max={max - 1}
            aria-label="Minimum price" 
            className="w-full h-10 text-sm" 
            placeholder="Min"
          />
        </div>
        <div className="text-gray-400 px-2">—</div>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm text-gray-500 font-medium">₹</span>
          <Input 
            type="number" 
            value={max} 
            onChange={handleMaxInputChange}
            min={min + 1}
            max={maxPrice}
            aria-label="Maximum price" 
            className="w-full h-10 text-sm" 
            placeholder="Max"
          />
        </div>
      </div>
      <div className="text-xs text-gray-400 text-center">
        Range: ₹{min.toLocaleString()} - ₹{max.toLocaleString()}
      </div>
    </div>
  );
};