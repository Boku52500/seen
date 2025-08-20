import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Truck, Shield, Check, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShippingInfo, PaymentInfo } from '../types/Cart';
import { authService } from '../services/authService';

interface Address {
  id: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface CheckoutPageProps {
  onBack: () => void;
  onOrderComplete: (orderId: string) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onOrderComplete }) => {
  const { items, subtotal, shipping, tax, total, clearCart } = useCart();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load saved addresses for logged-in users
  useEffect(() => {
    if (user) {
      loadSavedAddresses();
    }
  }, [user]);

  const loadSavedAddresses = async () => {
    try {
      const addresses = await authService.getAddresses();
      setSavedAddresses(addresses);
    } catch (error) {
      console.error('Error loading saved addresses:', error);
    }
  };

  const handleAddressSelection = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === '') {
      // Clear form when "Enter new address" is selected
      setShippingInfo({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
      });
    } else {
      // Populate form with selected address
      const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
      if (selectedAddress) {
        setShippingInfo({
          firstName: selectedAddress.firstName,
          lastName: selectedAddress.lastName,
          email: user?.email || '',
          phone: '', // Phone is not stored in address, keep empty
          address: selectedAddress.addressLine1 + (selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ''),
          city: selectedAddress.city,
          state: selectedAddress.state,
          postalCode: selectedAddress.postalCode,
          country: selectedAddress.country,
        });
      }
    }
  };

  const validateShipping = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!shippingInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingInfo.email.trim()) newErrors.email = 'Email is required';
    if (!shippingInfo.phone.trim()) newErrors.phone = 'Phone is required';
    if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';
    if (!shippingInfo.city.trim()) newErrors.city = 'City is required';
    
    // Country-specific validation
    if (shippingInfo.country === 'United States') {
      if (!shippingInfo.state.trim()) newErrors.state = 'State is required';
      if (!shippingInfo.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    } else if (shippingInfo.country === 'Georgia') {
      // Postal code is optional for Georgia
      // State field is not used for Georgia
    }
    
    // Email validation
    if (shippingInfo.email && !/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!paymentInfo.cardholderName.trim()) newErrors.cardholderName = 'Cardholder name is required';
    if (!paymentInfo.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    if (!paymentInfo.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
    if (!paymentInfo.cvv.trim()) newErrors.cvv = 'CVV is required';
    
    // Card number validation (basic)
    if (paymentInfo.cardNumber && paymentInfo.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    // CVV validation
    if (paymentInfo.cvv && (paymentInfo.cvv.length < 3 || paymentInfo.cvv.length > 4)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 'shipping' && validateShipping()) {
      setCurrentStep('payment');
    } else if (currentStep === 'payment' && validatePayment()) {
      setCurrentStep('review');
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate order ID
    const orderId = `ORD-${Date.now()}`;
    
    // Clear cart
    clearCart();
    
    setIsProcessing(false);
    onOrderComplete(orderId);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4 transition-colors duration-300"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to Cart</span>
            <span className="sm:hidden">Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-4 sm:space-x-8 overflow-x-auto pb-2">
            {[
              { key: 'shipping', label: 'Shipping', icon: Truck },
              { key: 'payment', label: 'Payment', icon: CreditCard },
              { key: 'review', label: 'Review', icon: Shield },
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted = 
                (step.key === 'shipping' && (currentStep === 'payment' || currentStep === 'review')) ||
                (step.key === 'payment' && currentStep === 'review');
              
              return (
                <div key={step.key} className="flex items-center flex-shrink-0">
                  <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-colors duration-300 ${
                    isCompleted ? 'bg-green-500 text-white' : 
                    isActive ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? <Check size={16} className="sm:w-5 sm:h-5" /> : <Icon size={16} className="sm:w-5 sm:h-5" />}
                  </div>
                  <span className={`ml-2 text-xs sm:text-sm font-medium transition-colors duration-300 ${
                    isActive ? 'text-black' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                  {index < 2 && (
                    <div className={`w-6 sm:w-8 h-px mx-2 sm:mx-4 transition-colors duration-300 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              {/* Shipping Information */}
              {currentStep === 'shipping' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
                {user && savedAddresses.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <h3 className="text-sm font-medium text-gray-700">Use Saved Address</h3>
                    </div>
                    <select
                      value={selectedAddressId}
                      onChange={(e) => handleAddressSelection(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Enter new address</option>
                      {savedAddresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.firstName} {address.lastName} - {address.addressLine1}, {address.city}, {address.country}
                          {address.isDefault && ' (Default)'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  
                  {/* State field - only for United States */}
                  {shippingInfo.country === 'United States' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <select
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                          errors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select State</option>
                        {US_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code {shippingInfo.country === 'United States' ? '*' : '(Optional)'}
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.postalCode}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="United States">United States</option>
                      <option value="Georgia">Georgia</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Information */}
            {currentStep === 'payment' && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Payment Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.cardholderName}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardholderName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                        errors.cardholderName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.cardholderName && <p className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                        errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryDate: formatExpiryDate(e.target.value) }))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                          errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                        placeholder="123"
                        maxLength={4}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${
                          errors.cvv ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Review */}
            {currentStep === 'review' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                  <div className="text-gray-600">
                    <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                    <p>{shippingInfo.address}</p>
                    <p>{shippingInfo.city}, {shippingInfo.postalCode}</p>
                    <p>{shippingInfo.country}</p>
                    <p>{shippingInfo.email}</p>
                    <p>{shippingInfo.phone}</p>
                  </div>
                  <button
                    onClick={() => setCurrentStep('shipping')}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    Edit
                  </button>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                  <div className="text-gray-600">
                    <p>**** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
                    <p>{paymentInfo.cardholderName}</p>
                  </div>
                  <button
                    onClick={() => setCurrentStep('payment')}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    Edit
                  </button>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-gray-600">
                            {item.selectedColor} • {item.selectedSize} • Qty: {item.quantity}
                          </p>
                          <p className="font-semibold">£{(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => {
                  if (currentStep === 'payment') setCurrentStep('shipping');
                  else if (currentStep === 'review') setCurrentStep('payment');
                }}
                className={`px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 ${
                  currentStep === 'shipping' ? 'invisible' : ''
                }`}
              >
                Back
              </button>
              
              {currentStep !== 'review' ? (
                <button
                  onClick={handleNextStep}
                  className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </button>
              )}
            </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
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
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total:</span>
                    <span>£{total.toFixed(2)}</span>
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

export default CheckoutPage;
