import React from 'react';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';

interface OrderConfirmationProps {
  orderId: string;
  onContinueShopping: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ orderId, onContinueShopping }) => {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <CheckCircle size={80} className="mx-auto text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Order Number:</span>
              <span className="font-mono font-medium">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span>Order Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Delivery:</span>
              <span>{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-6">What happens next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Package size={40} className="mx-auto text-blue-500 mb-3" />
              <h3 className="font-medium mb-2">Order Processing</h3>
              <p className="text-sm text-gray-600">We'll prepare your items for shipment within 1-2 business days.</p>
            </div>
            <div className="text-center">
              <Truck size={40} className="mx-auto text-blue-500 mb-3" />
              <h3 className="font-medium mb-2">Shipping</h3>
              <p className="text-sm text-gray-600">Your order will be shipped and you'll receive tracking information.</p>
            </div>
            <div className="text-center">
              <Home size={40} className="mx-auto text-blue-500 mb-3" />
              <h3 className="font-medium mb-2">Delivery</h3>
              <p className="text-sm text-gray-600">Your items will arrive at your doorstep within 5-7 business days.</p>
            </div>
          </div>
        </div>

        {/* Email Confirmation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800">
            📧 A confirmation email has been sent to your email address with order details and tracking information.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={onContinueShopping}
            className="w-full md:w-auto px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
          >
            Continue Shopping
          </button>
          
          <div className="text-sm text-gray-500">
            <p>Need help? Contact our customer service team at support@example.com</p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <span>✓</span>
              <span>30-day return policy</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>✓</span>
              <span>Secure payment processing</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>✓</span>
              <span>Free shipping on orders over £100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
