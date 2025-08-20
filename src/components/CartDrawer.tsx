import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onNavigateToCart: () => void;
  onNavigateToCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigateToCart, onNavigateToCheckout }) => {
  const { 
    items, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    shipping, 
    tax, 
    total 
  } = useCart();

  const handleCheckout = () => {
    closeCart();
    onNavigateToCheckout();
  };

  const handleViewCart = () => {
    closeCart();
    onNavigateToCart();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Cart Drawer */}
      <div 
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingBag size={20} />
              Shopping Cart ({items.length})
            </h2>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.product.name}</h3>
                      <div className="text-xs text-gray-500 mt-1">
                        <div className="flex items-center gap-2">
                          <span>Color: {item.selectedColor}</span>
                          <div 
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: item.selectedColorValue }}
                          />
                        </div>
                        <div>Size: {item.selectedSize}</div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            £{(item.product.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 hover:bg-red-100 text-red-500 rounded"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with totals and actions */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
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
                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <span>Total:</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={handleViewCart}
                  className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  View Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
