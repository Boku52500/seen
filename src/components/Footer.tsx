import React from 'react';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone, Heart, Truck, Award, Sparkles } from 'lucide-react';
import LogoFooter from '/assets/logofooter.png';
import { useAuth } from '../context/AuthContext';

interface FooterProps {
  onNavigateToFavorites?: () => void;
}

export default function Footer({ onNavigateToFavorites }: FooterProps) {
  const { user } = useAuth();

  return (
    <footer className="bg-white text-black py-16 fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 py-12 border-b border-gray-200">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Truck className="w-12 h-12 text-black" />
            </div>
            <h3 className="text-sm font-semibold text-black mb-2 tracking-wider uppercase">WORLDWIDE SHIPPING</h3>
            <p className="text-gray-600 text-sm">DELIVERING TO YOUR DOORSTEP</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Sparkles className="w-12 h-12 text-black" />
            </div>
            <h3 className="text-sm font-semibold text-black mb-2 tracking-wider uppercase">PREMIUM MATERIALS</h3>
            <p className="text-gray-600 text-sm">FINEST QUALITY MATERIALS SELECTED</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Award className="w-12 h-12 text-black" />
            </div>
            <h3 className="text-sm font-semibold text-black mb-2 tracking-wider uppercase">ETHICALLY MADE</h3>
            <p className="text-gray-600 text-sm">CRAFTED WITH CARE AND RESPONSIBILITY</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 stagger-animation">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <img src={LogoFooter} alt="OddMuse" className="h-24 mb-4" />
              <p className="text-gray-600 text-lg leading-relaxed max-w-md">
              Empowering women to own their confidence, embrace their femininity, and always be – SEEN
              </p>
            </div>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/sseenstudios/"
                className="bg-black hover:bg-pink-600 p-3 rounded-full transition-all duration-300 transform hover:scale-110"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <button
                onClick={() => {
                  if (user && onNavigateToFavorites) {
                    onNavigateToFavorites();
                  }
                }}
                className="bg-black hover:bg-red-500 p-3 rounded-full transition-all duration-300 transform hover:scale-110"
              >
                <Heart className="w-5 h-5 text-white" />
              </button>
             
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
            <li><a href="/" className="text-black-300 hover:text-gray-400 transition-colors duration-300 text-sm">Home</a></li>
            <li><a href="/shop" className="text-black-300 hover:text-gray-400 transition-colors duration-300 text-sm">Shop</a></li>
              <li><a href="/about" className="text-black-300 hover:text-gray-400 transition-colors duration-300 text-sm">About Us</a></li>
              <li><a href="/contact" className="text-black-300 hover:text-gray-400 transition-colors duration-300 text-sm">Contact</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><a href="/dresses" className="text-black-300 hover:text-gray-400 transition-colors duration-300 text-sm">Dresses</a></li>
              <li><a href="/sets" className="text-black-300 hover:text-gray-400 transition-colors duration-300 text-sm">Sets</a></li>
            </ul>
          </div>

          
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600 mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
              &copy; 2025 Seen Studios. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6 text-xs sm:text-sm">
              <a href="/privacy-policy" className="text-black-400 hover:text-gray-400 transition-colors duration-300">Privacy Policy</a>
              <a href="/terms" className="text-black-400 hover:text-gray-400 transition-colors duration-300">Terms of Service</a>
              <a href="/returns" className="text-black-400 hover:text-gray-400 transition-colors duration-300">Returns</a>
              <a href="/shipping" className="text-black-400 hover:text-gray-400 transition-colors duration-300">Shipping</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
