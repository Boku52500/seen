import React, { useState, useEffect } from 'react';
import { User, MapPin, Package, Edit, Plus, Trash2, Save, X, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavourites } from '../context/FavouritesContext';
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

interface CustomerProfilePageProps {
  initialTab?: 'profile' | 'addresses' | 'orders' | 'favourites';
}

const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({ initialTab = 'profile' }) => {
  const { user } = useAuth();
  const { favourites, removeFromFavourites } = useFavourites();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders' | 'favourites'>(initialTab);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    displayName: ''
  });

  const [addressForm, setAddressForm] = useState({
    type: 'shipping' as 'shipping' | 'billing',
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isDefault: false
  });

  const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const COUNTRIES = ['United States', 'Georgia'];

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load current user data
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setProfileForm({
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          displayName: currentUser.displayName || ''
        });
      }

      // Load addresses
      const userAddresses = await authService.getAddresses();
      setAddresses(userAddresses);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      // Note: Profile update API endpoint would need to be implemented on the server
      // For now, we'll just update the display locally
      console.log('Profile update would be sent to server:', profileForm);
      setEditingProfile(false);
      // TODO: Implement profile update API endpoint
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSaveAddress = async () => {
    // Validate all required fields
    const requiredFields = [
      addressForm.firstName,
      addressForm.lastName,
      addressForm.addressLine1,
      addressForm.city,
      addressForm.country
    ];

    // Add state and postal code validation only for United States
    if (addressForm.country === 'United States') {
      requiredFields.push(addressForm.state, addressForm.postalCode);
    }

    if (!user || requiredFields.some(field => !field || field.trim() === '')) {
      alert('Please fill in all required fields');
      return;
    }

    // Debug: Log form state before processing
    console.log('Raw addressForm state:', addressForm);
    
    // Prepare address data with proper field mapping
    const addressData = {
      type: addressForm.type,
      firstName: addressForm.firstName?.trim() || '',
      lastName: addressForm.lastName?.trim() || '',
      addressLine1: addressForm.addressLine1?.trim() || '',
      addressLine2: addressForm.addressLine2?.trim() || '',
      city: addressForm.city?.trim() || '',
      state: addressForm.country === 'United States' ? (addressForm.state?.trim() || '') : '',
      postalCode: addressForm.country === 'United States' ? (addressForm.postalCode?.trim() || '') : '',
      country: addressForm.country,
      isDefault: addressForm.isDefault || false
    };

    console.log('Processed address data being sent to API:', addressData);

    try {
      if (editingAddress) {
        // Update existing address
        await authService.updateAddress(editingAddress.id, addressData);
      } else {
        // Add new address
        await authService.addAddress(addressData);
      }
      
      await loadUserData();
      setShowAddressForm(false);
      setEditingAddress(null);
      resetAddressForm();
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await authService.deleteAddress(addressId);
        await loadUserData();
      } catch (error) {
        console.error('Error deleting address:', error);
      }
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      type: 'shipping',
      firstName: '',
      lastName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      isDefault: false
    });
  };

  const handleCountryChange = (country: string) => {
    setAddressForm(prev => ({
      ...prev,
      country,
      state: country === 'Georgia' ? '' : prev.state,
      postalCode: country === 'Georgia' ? '' : prev.postalCode
    }));
  };

  const startEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      type: address.type,
      firstName: address.firstName,
      lastName: address.lastName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-xl">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">My Account</h1>
          <p className="text-gray-600">Manage your profile, addresses, and orders</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'addresses', label: 'Addresses', icon: MapPin },
              { id: 'favourites', label: 'Favourites', icon: Heart },
              { id: 'orders', label: 'Orders', icon: Package }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Edit size={16} />
                  <span>{editingProfile ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              {editingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.displayName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                    />
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Display Name:</span>
                    <p className="font-medium">{user?.displayName || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Name:</span>
                    <p className="font-medium">
                      {profileForm.firstName || profileForm.lastName 
                        ? `${profileForm.firstName} ${profileForm.lastName}`.trim()
                        : 'Not provided'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Saved Addresses</h2>
              <button
                onClick={() => {
                  resetAddressForm();
                  setShowAddressForm(true);
                }}
                className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                <Plus className="w-4 h-4" />
                <span>Add Address</span>
              </button>
            </div>

            {addresses && addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address: Address) => (
                  <div key={address.id} className="border border-gray-200 rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          address.type === 'shipping' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {address.type}
                        </span>
                        {address.isDefault && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditAddress(address)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">{address.firstName} {address.lastName}</p>
                      <p>{address.addressLine1}</p>
                      {address.addressLine2 && <p>{address.addressLine2}</p>}
                      <p>{address.city}, {address.state} {address.postalCode}</p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No addresses saved yet.</p>
                <p>Add an address to get started.</p>
              </div>
            )}

            {/* Address Form Modal */}
            {showAddressForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                        resetAddressForm();
                      }}
                      className="text-gray-500 hover:text-black"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Type
                      </label>
                      <select
                        value={addressForm.type}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, type: e.target.value as 'shipping' | 'billing' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      >
                        <option value="shipping">Shipping</option>
                        <option value="billing">Billing</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={addressForm.firstName || ''}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={addressForm.lastName || ''}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        value={addressForm.addressLine1 || ''}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          value={addressForm.city || ''}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                          required
                        />
                      </div>
                      {addressForm.country === 'United States' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State *
                          </label>
                          <select
                            value={addressForm.state || ''}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                            required
                          >
                            <option value="">Select State</option>
                            {US_STATES.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {addressForm.country === 'United States' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          value={addressForm.postalCode || ''}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, postalCode: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                          placeholder="ZIP Code"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <select
                        value={addressForm.country || ''}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                        required
                      >
                        {COUNTRIES.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                        className="rounded border-gray-300 text-black focus:ring-black mr-2"
                      />
                      <label htmlFor="isDefault" className="text-sm text-gray-700">
                        Set as default {addressForm.type} address
                      </label>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <button
                        onClick={handleSaveAddress}
                        className="flex-1 bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
                      >
                        Save Address
                      </button>
                      <button
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                          resetAddressForm();
                        }}
                        className="flex-1 border border-gray-300 py-2 px-4 rounded hover:border-black"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Favourites Tab */}
        {activeTab === 'favourites' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">My Favourites</h2>
            
            {favourites.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No favourites yet.</p>
                <p>Start adding items to your favourites to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favourites.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden group">
                    <div className="relative aspect-square">
                      <img
                        src={product.productImage}
                        alt={product.productName}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeFromFavourites(product.productId)}
                        className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Heart size={16} className="text-red-500 fill-red-500" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1">{product.productName}</h3>
                      <p className="text-gray-600 text-sm mb-2">{product.productCategory}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">${product.productPrice}</span>
                        <button className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors">
                          View Product
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Order History</h2>
            
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No orders yet.</p>
              <p>Start shopping to see your orders here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfilePage;