import React, { useState, useEffect } from 'react';
import HeroPage from './components/HeroPage';
import Shop from './components/Shop';
import Admin from './components/Admin';
import CustomerProfile from './components/CustomerProfile';
import ProductPage from './components/ProductPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import OrderConfirmation from './components/OrderConfirmation';
import CartDrawer from './components/CartDrawer';
import Navbar from './components/Navbar.tsx';
import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import ReturnsPolicy from './components/ReturnsPolicy';
import ShippingPolicy from './components/ShippingPolicy';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import LoadingSpinner from './components/LoadingSpinner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { FavouritesProvider } from './context/FavouritesContext';
import { Product } from './types/Product';
import { productService } from './services/productService';
import { generateProductSlug, extractIdFromSlug } from './utils/slugify';

// Admin access is restricted to owner only
// To access admin: go to /admin?key=owner2024
const ProtectedAdmin: React.FC = () => {
  const { loading } = useAuth();
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    // Check for admin access key in URL
    const urlParams = new URLSearchParams(window.location.search);
    const adminKey = urlParams.get('key');
    
    // Only allow admin access with the correct key (you can change this)
    if (adminKey === 'b2IRmtKzQEzQli9') {
      setHasAdminAccess(true);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading admin..." />
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6">Admin access is restricted to the store owner.</p>
          <p className="text-sm text-gray-500">This area is not accessible to customers.</p>
        </div>
      </div>
    );
  }

  return <Admin />;
};

// Protected Customer Profile Component
const ProtectedProfile: React.FC<{ initialTab?: 'profile' | 'addresses' | 'orders' | 'favourites' }> = ({ initialTab = 'profile' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading profile..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to access your account.</p>
          <p className="text-sm text-gray-500">Click the user icon in the navbar to sign in.</p>
        </div>
      </div>
    );
  }

  return <CustomerProfile initialTab={initialTab} />;
};

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [loadingProduct, setLoadingProduct] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [profileInitialTab, setProfileInitialTab] = useState<'profile' | 'addresses' | 'orders' | 'favourites'>('profile');

  // Initialize page from URL path and fetch product if needed
  useEffect(() => {
    const path = window.location.pathname.slice(1) || 'home';
    
    // Handle product URLs with slugs (e.g., /product/black-halter-top-6dd9fa67)
    if (path.startsWith('product/')) {
      const slug = path.split('/')[1];
      setCurrentPage('product');
      
      // Extract product ID from slug
      const productId = extractIdFromSlug(slug);
      
      if (!productId) {
        // Invalid slug format, redirect to shop
        console.error('Invalid product slug format:', slug);
        setCurrentPage('shop');
        window.history.pushState({}, '', '/shop');
        return;
      }
      
      // Fetch the specific product by ID if not already selected
      if (!selectedProduct || selectedProduct.id !== productId) {
        setLoadingProduct(true);
        console.log('Fetching product with ID:', productId, 'from slug:', slug);
        
        productService.getProductById(productId)
          .then((product) => {
            console.log('Product fetch result:', product);
            if (product) {
              setSelectedProduct(product);
            } else {
              // Product not found, redirect to shop
              console.error('Product not found for ID:', productId);
              setCurrentPage('shop');
              window.history.pushState({}, '', '/shop');
            }
          })
          .catch((error) => {
            console.error('Error fetching product:', error);
            // Redirect to shop on error
            setCurrentPage('shop');
            window.history.pushState({}, '', '/shop');
          })
          .finally(() => {
            setLoadingProduct(false);
          });
      }
    } else {
      setCurrentPage(path);
    }
  }, [selectedProduct]);

  // Handle page changes and update URL
  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    window.history.pushState({}, '', page === 'home' ? '/' : `/${page}`);
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.slice(1) || 'home';
      setCurrentPage(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scroll to top when the page changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
    });
  }, [currentPage]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product');
    // Update URL to include product slug (name-based)
    const slug = generateProductSlug(product.name, product.id);
    window.history.pushState({}, '', `/product/${slug}`);
  };

  const handleBackToShop = () => {
    setSelectedProduct(null);
    setCurrentPage('shop');
  };

  const handleNavigateToCart = () => {
    setCurrentPage('cart');
  };

  const handleNavigateToCheckout = () => {
    setCurrentPage('checkout');
  };

  const handleOrderComplete = (newOrderId: string) => {
    setOrderId(newOrderId);
    setCurrentPage('order-confirmation');
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
  };

  const handleNavigateToFavorites = () => {
    setProfileInitialTab('favourites');
    setCurrentPage('profile');
    window.history.pushState({}, '', '/profile');
  };


  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HeroPage onProductSelect={handleProductSelect} />;
      case 'admin':
        return <ProtectedAdmin />;
      case 'profile':
        return <ProtectedProfile initialTab={profileInitialTab} />;
      case 'shop':
        return <Shop onProductSelect={handleProductSelect} categoryFilter={categoryFilter} />;
      case 'dresses':
        return <Shop onProductSelect={handleProductSelect} categoryFilter="Dresses" />;
      case 'sets':
        return <Shop onProductSelect={handleProductSelect} categoryFilter="Sets" />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsOfService />;
      case 'returns':
        return <ReturnsPolicy />;
      case 'shipping':
        return <ShippingPolicy />;
      case 'product':
        if (loadingProduct) {
          return (
            <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
              <LoadingSpinner size="large" text="Loading product..." />
            </div>
          );
        }
        return selectedProduct ? (
          <ProductPage 
            product={selectedProduct}
            onBack={handleBackToShop}
            onBuyNow={handleNavigateToCheckout}
          />
        ) : (
          <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
              <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
              <button 
                onClick={handleBackToShop}
                className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors"
              >
                Back to Shop
              </button>
            </div>
          </div>
        );
      case 'cart':
        return (
          <CartPage 
            onBack={handleBackToShop}
            onCheckout={handleNavigateToCheckout}
          />
        );
      case 'checkout':
        return (
          <CheckoutPage 
            onBack={handleNavigateToCart}
            onOrderComplete={handleOrderComplete}
          />
        );
      case 'order-confirmation':
        return (
          <OrderConfirmation 
            orderId={orderId}
            onContinueShopping={() => setCurrentPage('shop')}
          />
        );
      case 'contact':
        return <Contact />;
      case 'about':
        return <AboutUs />;
      default:
        return <HeroPage />;
    }
  };

  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <FavouritesProvider>
            <div className="relative min-h-screen flex flex-col">
              <Navbar 
          currentPage={currentPage} 
          onPageChange={handlePageChange} 
          onCategoryFilter={handleCategoryFilter}
          onNavigateToFavorites={handleNavigateToFavorites}
        />
              <main className="flex-1">
                <PageTransition pageKey={currentPage}>
                  {renderPage()}
                </PageTransition>
              </main>
              <Footer onNavigateToFavorites={handleNavigateToFavorites} />
              <CartDrawer 
                onNavigateToCart={handleNavigateToCart}
                onNavigateToCheckout={handleNavigateToCheckout}
              />
            </div>
          </FavouritesProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
