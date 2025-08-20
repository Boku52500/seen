// PostgreSQL-based customer service
// In production, this would use proper database queries with Drizzle ORM
import { CustomerProfile, CustomerAddress, Order } from '../types/Customer';

export const customerService = {
  // Get customer profile (mock implementation for browser)
  getCustomerProfile: async (uid: string): Promise<CustomerProfile | null> => {
    try {
      // In browser environment, return mock data or localStorage data
      if (typeof window !== 'undefined') {
        console.log('Customer service: Getting mock profile for browser environment');
        
        // Try to get from localStorage first
        const storedProfile = localStorage.getItem(`customerProfile_${uid}`);
        if (storedProfile) {
          return JSON.parse(storedProfile);
        }
        
        // Return mock profile if none stored
        return {
          uid,
          id: uid,
          email: `user_${uid}@example.com`,
          displayName: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          addresses: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as CustomerProfile;
      }
      
      // Server-side would query PostgreSQL
      return null;
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      return null;
    }
  },

  // Create or update customer profile (mock implementation for browser)
  saveCustomerProfile: async (uid: string, profile: Partial<CustomerProfile>): Promise<void> => {
    try {
      // In browser environment, save to localStorage
      if (typeof window !== 'undefined') {
        console.log('Customer service: Saving mock profile for browser environment');
        const existingProfile = await customerService.getCustomerProfile(uid);
        const updatedProfile = {
          ...existingProfile,
          ...profile,
          uid,
          id: uid,
          updatedAt: new Date(),
        };
        localStorage.setItem(`customerProfile_${uid}`, JSON.stringify(updatedProfile));
        return;
      }
      
      // Server-side would update PostgreSQL
      console.log('Server-side customer profile save not implemented yet');
    } catch (error) {
      console.error('Error saving customer profile:', error);
      throw new Error('Failed to save customer profile');
    }
  },

  // Add address to customer profile
  addAddress: async (uid: string, address: Omit<CustomerAddress, 'id'>): Promise<void> => {
    try {
      const profile = await customerService.getCustomerProfile(uid);
      if (!profile) {
        throw new Error('Customer profile not found');
      }

      const newAddress: CustomerAddress = {
        ...address,
        id: `addr_${Date.now()}`,
      };

      const updatedAddresses = [...(profile.addresses || []), newAddress];
      
      await customerService.saveCustomerProfile(uid, {
        addresses: updatedAddresses,
      });
    } catch (error) {
      console.error('Error adding address:', error);
      throw new Error('Failed to add address');
    }
  },

  // Update address
  updateAddress: async (uid: string, addressId: string, updates: Partial<CustomerAddress>): Promise<void> => {
    try {
      const profile = await customerService.getCustomerProfile(uid);
      if (!profile) {
        throw new Error('Customer profile not found');
      }

      const updatedAddresses = (profile.addresses || []).map(addr => 
        addr.id === addressId ? { ...addr, ...updates } : addr
      );
      
      await customerService.saveCustomerProfile(uid, {
        addresses: updatedAddresses,
      });
    } catch (error) {
      console.error('Error updating address:', error);
      throw new Error('Failed to update address');
    }
  },

  // Delete address
  deleteAddress: async (uid: string, addressId: string): Promise<void> => {
    try {
      const profile = await customerService.getCustomerProfile(uid);
      if (!profile) {
        throw new Error('Customer profile not found');
      }

      const updatedAddresses = (profile.addresses || []).filter(addr => addr.id !== addressId);
      
      await customerService.saveCustomerProfile(uid, {
        addresses: updatedAddresses,
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      throw new Error('Failed to delete address');
    }
  },

  // Get customer orders (mock implementation for browser)
  getCustomerOrders: async (uid: string): Promise<Order[]> => {
    try {
      // In browser environment, return mock orders or localStorage data
      if (typeof window !== 'undefined') {
        console.log('Customer service: Getting mock orders for browser environment');
        const storedOrders = localStorage.getItem(`customerOrders_${uid}`);
        if (storedOrders) {
          return JSON.parse(storedOrders);
        }
        
        // Return empty array for mock
        return [];
      }
      
      // Server-side would query PostgreSQL orders table
      return [];
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    }
  },
};
