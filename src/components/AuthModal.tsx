import React, { useState, useRef, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const savedScrollY = useRef<number>(0);

  // Enhanced scroll lock with no positioning conflicts
  useEffect(() => {
    if (!isOpen) return;

    // Save current scroll position
    savedScrollY.current = window.scrollY;
    
    // Get scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Apply scroll lock
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    
    // Cleanup function
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // Restore scroll position smoothly
      if (savedScrollY.current > 0) {
        window.scrollTo({
          top: savedScrollY.current,
          behavior: 'instant'
        });
      }
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (!formData.name.trim()) {
          setErrors('Name is required');
          setLoading(false);
          return;
        }
        await register(formData.email, formData.password, formData.name);
      }
      onClose();
      setFormData({ name: '', email: '', password: '' });
    } catch (error: any) {
      setErrors(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors('');
    setFormData({ name: '', email: '', password: '' });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Portal-like overlay with absolute positioning */}
      <div
        className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-[9999]"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999
        }}
        onClick={handleOverlayClick}
      />
      
      {/* Modal container with viewport-based centering */}
      <div
        className="fixed top-0 left-0 w-full h-full z-[10000] pointer-events-none"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
      >
        {/* Modal content */}
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto"
          style={{
            maxHeight: '90vh',
            overflow: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black transition-colors"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-black transition-colors"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>

              {errors && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                  {errors}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            {/* Toggle mode */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={toggleMode}
                  className="ml-1 text-black font-medium hover:underline transition-all"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;