import React, { useState, useEffect, useRef } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  pageKey: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, pageKey }) => {
  const [displayedPage, setDisplayedPage] = useState(pageKey);
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const previousPageRef = useRef(pageKey);
  const containerRef = useRef<HTMLDivElement>(null);

  // Define pages that should have transitions
  const transitionPages = ['home', 'shop', 'product', 'cart', 'checkout', 'about', 'contact', 'profile', 'admin', 'order-confirmation'];
  
  // Check if current page change warrants a transition
  const shouldTransition = (newPage: string, oldPage: string) => {
    return transitionPages.includes(newPage) && 
           transitionPages.includes(oldPage) && 
           newPage !== oldPage;
  };

  useEffect(() => {
    if (pageKey !== previousPageRef.current) {
      const oldPage = previousPageRef.current;
      
      if (shouldTransition(pageKey, oldPage)) {
        // Start exit animation
        setIsExiting(true);
        setIsEntering(false);
        
        // After exit animation, change content and start enter animation
        const exitTimer = setTimeout(() => {
          setDisplayedPage(pageKey);
          previousPageRef.current = pageKey;
          setIsExiting(false);
          
          // Start enter animation on next frame
          requestAnimationFrame(() => {
            setIsEntering(true);
            
            // Complete enter animation
            const enterTimer = setTimeout(() => {
              setIsEntering(false);
            }, 400);
            
            return () => clearTimeout(enterTimer);
          });
        }, 250);
        
        return () => clearTimeout(exitTimer);
      } else {
        // No transition needed - instant change
        setDisplayedPage(pageKey);
        previousPageRef.current = pageKey;
        setIsExiting(false);
        setIsEntering(false);
      }
    }
  }, [pageKey]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full"
      style={{ minHeight: '100vh' }}
    >
      <div 
        className={`absolute inset-0 w-full transition-all duration-300 ease-out ${
          isExiting 
            ? 'opacity-0 transform translate-y-4 scale-[0.98]' 
            : isEntering
            ? 'opacity-100 transform translate-y-0 scale-100'
            : 'opacity-100 transform translate-y-0 scale-100'
        }`}
        style={{
          transitionProperty: 'opacity, transform',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {displayedPage === pageKey ? children : null}
      </div>
    </div>
  );
};

export default PageTransition;
