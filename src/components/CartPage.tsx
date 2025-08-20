import React from 'react';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartPageProps {
  onBack: () => void;
  onCheckout: () => void;
}

const CartPage: React.FC<CartPageProps> = ({ onBack, onCheckout }) => {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    shipping, 
    tax, 
    total,
    clearCart
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-6"
          >
            <ArrowLeft size={20} />
            Continue Shopping
          </button>
          
          <div className="text-center py-16">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
            >
              <ArrowLeft size={20} />
              Continue Shopping
            </button>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-gray-600">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
          </div>
          
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-6 border rounded-lg bg-white shadow-sm">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{item.product.name}</h3>
                      <p className="text-gray-600">£{item.product.price}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Color:</span>
                      <span className="text-sm font-medium">{item.selectedColor}</span>
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.selectedColorValue }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Size:</span>
                      <span className="text-sm font-medium">{item.selectedSize}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        £{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
                  <span>£{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>£{shipping.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>£{tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={onCheckout}
                className="w-full py-3 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
              >
                Proceed to Checkout
              </button>
              
              <div className="mt-4 text-center">
                <button
                  onClick={onBack}
                  className="text-sm text-gray-600 hover:text-black"
                >
                  Continue Shopping
                </button>
              </div>
              
              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t">
                <div className="text-xs text-gray-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Free shipping on orders over £100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>30-day return policy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
