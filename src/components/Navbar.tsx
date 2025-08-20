import React, { useState, useEffect, useRef } from "react";
import { User, Heart, ShoppingBag, Menu, X } from "lucide-react";
import logoBlack from "/assets/logoblack.png";
import logoWhite from "/assets/logowhite.png";
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onCategoryFilter?: (category: string) => void;
  onNavigateToFavorites?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange, onCategoryFilter, onNavigateToFavorites }) => {
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount, toggleCart } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setShowUserMenu(false);
    }
  };


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    if (showUserMenu || showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showMobileMenu]);

  // Close dropdown when user changes
  useEffect(() => {
    setShowUserMenu(false);
  }, [user]);

  const isHomePage = currentPage === "home";

  // Dynamic background classes
  const navbarStyles = isHomePage
    ? scrolled
      ? "bg-white/90 shadow-sm border-b border-neutral-200 backdrop-blur-sm"
      : "bg-transparent border-transparent"
    : "bg-white/90 shadow-sm border-b border-neutral-200 backdrop-blur-sm";

  // Determine logo
  const logoSrc =
    isHomePage && !scrolled
      ? logoWhite // not scrolled on home
      : logoBlack; // scrolled or not home

  const handleMenuClick = (label: string, page: string) => {
    if ((label === "Dresses" || label === "Sets") && onCategoryFilter) {
      onCategoryFilter(label);
      onPageChange(page);
    } else if (label === "Shop" && onCategoryFilter) {
      onCategoryFilter(''); // Clear category filter for Shop
      onPageChange(page);
    } else {
      onPageChange(page);
    }
    // Close mobile menu when navigation item is clicked
    setShowMobileMenu(false);
  };

  const menuItems = [
    { label: "Dresses", page: "dresses" },
    { label: "Sets", page: "sets" },
    { label: "Shop", page: "shop" },
    { label: "About Us", page: "about" },
    { label: "Contact", page: "contact" },
  ];

  return (
    <>
      <div
        className={`fixed top-0 left-0 z-50 flex items-center justify-between text-lg uppercase ${navbarStyles}`}
        style={{
          width: 'calc(100vw - (100vw - 100%))',
          paddingLeft: 'clamp(1rem, 5vw, 3rem)',
          paddingRight: 'clamp(1rem, 5vw, 3rem)',
          paddingTop: '1rem',
          paddingBottom: '1rem',
          transition: 'background-color 300ms ease-in-out, border-color 300ms ease-in-out, backdrop-filter 300ms ease-in-out'
        }}
      >
        {/* Logo */}
        <div className="cursor-pointer" onClick={() => onPageChange("home")}>
          <img src={logoSrc} alt="Logo" className="h-12 sm:h-14 lg:h-16 w-auto transition-all duration-300" />
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex space-x-8 xl:space-x-10 font-medium">
          {menuItems.map(({ label, page }) => (
            <button
              key={page}
              onClick={() => handleMenuClick(label, page)}
              className={`${
                isHomePage
                  ? scrolled
                    ? "text-black"
                    : "text-white"
                  : "text-black"
              } transition-colors duration-300 hover:opacity-70 ${
                currentPage === page ? "font-semibold" : ""
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`lg:hidden p-2 ${
            isHomePage
              ? scrolled
                ? "text-black"
                : "text-white"
              : "text-black"
          } transition-colors duration-300`}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Toggle mobile menu"
        >
          {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop Icons */}
        <div className="hidden lg:flex space-x-4 xl:space-x-6 items-center">
          <Heart
            className={`w-6 h-6 xl:w-7 xl:h-7 ${
              isHomePage
                ? scrolled
                  ? "text-black"
                  : "text-white"
                : "text-black"
            } transition-colors duration-300 cursor-pointer hover:opacity-70`}
            onClick={() => {
              if (user) {
                if (onNavigateToFavorites) {
                  onNavigateToFavorites();
                } else {
                  onPageChange('profile');
                }
              } else {
                setShowAuthModal(true);
              }
            }}
          />
          <div className="relative cursor-pointer" onClick={toggleCart}>
            <ShoppingBag
              className={`w-6 h-6 xl:w-7 xl:h-7 ${
                isHomePage
                  ? scrolled
                    ? "text-black"
                    : "text-white"
                  : "text-black"
              } transition-colors duration-300 hover:opacity-70`}
            />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </div>
          
          {/* User Authentication */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <div>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-2 ${
                    isHomePage
                      ? scrolled
                        ? "text-black"
                        : "text-white"
                      : "text-black"
                  } transition-colors duration-300 hover:opacity-70`}
                >
                  <User className="w-6 h-6 xl:w-7 xl:h-7" />
                  <span className="text-sm hidden xl:block">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-gray-200">
                      <p className="font-medium text-base text-gray-900">{user.displayName || user.email}</p>
                      <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          onPageChange('profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-base text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        My Account
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-base text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className={`flex items-center justify-center ${
                  isHomePage
                    ? scrolled
                      ? "text-black"
                      : "text-white"
                    : "text-black"
                } transition-colors duration-300 hover:opacity-70`}
              >
                <User className="w-6 h-6 xl:w-7 xl:h-7" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
<div
  ref={mobileMenuRef}
  className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
    showMobileMenu ? 'translate-x-0' : 'translate-x-full'
  }`}
>
  <div className="flex flex-col h-full">
    {/* Mobile Menu Header */}
    <div className="flex items-center justify-between p-6 border-b border-gray-100">
      <img src={logoBlack} alt="Logo" className="h-10 w-auto" />
      <button
        onClick={() => setShowMobileMenu(false)}
        className="p-2 text-gray-600 hover:text-black transition-colors"
        aria-label="Close menu"
      >
        <X className="w-6 h-6" />
      </button>
    </div>

    {/* Mobile Menu Items */}
    <div className="flex-1 py-8 overflow-y-auto">
      <nav className="space-y-1">
        {menuItems.map(({ label, page }) => (
          <button
            key={page}
            onClick={() => handleMenuClick(label, page)}
            className={`block w-full text-left px-6 py-4 text-lg font-medium transition-colors ${
              currentPage === page
                ? 'text-black bg-gray-50 border-r-4 border-black'
                : 'text-gray-700 hover:text-black hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>

    {/* Mobile Menu Footer */}
    <div className="border-t border-gray-100 p-6">
      <div className="flex items-center justify-center space-x-8">
        <button
          onClick={() => {
            if (user) onNavigateToFavorites?.();
            else setShowAuthModal(true);
            setShowMobileMenu(false);
          }}
          className="flex flex-col items-center space-y-2 text-gray-600 hover:text-black transition-colors"
        >
          <Heart className="w-6 h-6" />
          <span className="text-sm">Favorites</span>
        </button>

        <button
          onClick={() => {
            toggleCart();
            setShowMobileMenu(false);
          }}
          className="flex flex-col items-center space-y-2 text-gray-600 hover:text-black transition-colors relative"
        >
          <ShoppingBag className="w-6 h-6" />
          <span className="text-sm">Cart</span>
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            if (user) onPageChange('profile');
            else setShowAuthModal(true);
            setShowMobileMenu(false);
          }}
          className="flex flex-col items-center space-y-2 text-gray-600 hover:text-black transition-colors"
        >
          <User className="w-6 h-6" />
          <span className="text-sm">{user ? 'Profile' : 'Login'}</span>
        </button>
      </div>

      {user && (
        <button
          onClick={() => {
            handleLogout();
            setShowMobileMenu(false);
          }}
          className="w-full mt-4 py-3 text-center text-gray-600 hover:text-black transition-colors border-t border-gray-100 pt-4"
        >
          Logout
        </button>
      )}
    </div>
  </div>
</div>

{/* Mobile Menu Overlay */}
{showMobileMenu && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
    onClick={() => setShowMobileMenu(false)}
  />
)}

      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default Navbar;
