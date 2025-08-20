import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface MobileFiltersDrawerProps {
  showFilters: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export const MobileFiltersDrawer: React.FC<MobileFiltersDrawerProps> = ({
  showFilters,
  onClose,
  children
}) => {
  const [isMounted, setIsMounted] = useState(showFilters);
  const [isVisible, setIsVisible] = useState(false); // controls actual slide

  // Mount/unmount for animation
  useEffect(() => {
    if (showFilters) {
      setIsMounted(true);
      // Next tick allow in-animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [showFilters]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (showFilters) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showFilters]);

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (showFilters) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showFilters, onClose]);

  if (!isMounted) return null;

  const handleTransitionEnd = () => {
    if (!isVisible) setIsMounted(false); // unmount after slide-out
  };

  const drawer = createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-40' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-label="Close filters overlay"
      />

      {/* Drawer */}
      <div
        className={`
          fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white border-r border-black p-6 z-[9999]
          overflow-y-auto transform transition-transform duration-300 ease-in-out
          ${isVisible ? 'translate-x-0' : '-translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filters-title"
        onTransitionEnd={handleTransitionEnd}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
          <h2 id="filters-title" className="text-lg font-semibold text-black">
            Filters
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {children || (
            <>
              <div className="space-y-4">
                <h3 className="text-base font-medium text-black">Filter option 1</h3>
                <div className="space-y-2">
                  <label className="flex items-center text-sm text-gray-700">
                    <input type="checkbox" className="mr-2 rounded border-gray-300" />
                    Option A
                  </label>
                  <label className="flex items-center text-sm text-gray-700">
                    <input type="checkbox" className="mr-2 rounded border-gray-300" />
                    Option B
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-medium text-black">Filter option 2</h3>
                <div className="space-y-2">
                  <label className="flex items-center text-sm text-gray-700">
                    <input type="checkbox" className="mr-2 rounded border-gray-300" />
                    Option X
                  </label>
                  <label className="flex items-center text-sm text-gray-700">
                    <input type="checkbox" className="mr-2 rounded border-gray-300" />
                    Option Y
                  </label>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );

  return drawer;
};

export default MobileFiltersDrawer;
