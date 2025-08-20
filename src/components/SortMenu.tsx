import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SortMenuProps {
  currentSort: string;
  onSortChange: (sortValue: string) => void;
  getSortLabel: (sortValue: string) => string;
  className?: string;
}

export const SortMenu: React.FC<SortMenuProps> = ({
  currentSort,
  onSortChange,
  getSortLabel,
  className = ""
}) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortOptions = [
    { value: 'best-selling', label: 'Best Selling' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'name-a-z', label: 'Name: A-Z' },
    { value: 'name-z-a', label: 'Name: Z-A' }
  ];

  const handleSortSelect = (sortValue: string) => {
    onSortChange(sortValue);
    setShowSortDropdown(false);
  };

  // Close dropdown when clicking outside
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSortDropdown]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showSortDropdown]);

  return (
    <div ref={containerRef} className="relative inline-block w-full sm:w-64">
      <button
        onClick={() => setShowSortDropdown(prev => !prev)}
        className={`flex items-center justify-between gap-2 text-sm sm:text-base text-black hover:opacity-80 border border-black px-3 py-2 rounded-lg w-full ${className}`}
        aria-haspopup="listbox"
        aria-expanded={showSortDropdown}
      >
        <span className="truncate">{getSortLabel(currentSort)}</span>
        <ChevronDown className="w-4 h-4 shrink-0" />
      </button>

      {showSortDropdown && (
        <div
          data-sort-dropdown
          className="absolute z-[10000] mt-2 w-56 bg-white border border-black rounded-lg shadow-xl"
        >
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleSortSelect(option.value)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                currentSort === option.value ? 'bg-gray-50 font-medium' : ''
              }`}
              role="option"
              aria-selected={currentSort === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortMenu;
