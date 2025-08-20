// Database-based authentication service using API endpoints

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  firstName?: string | null;
  lastName?: string | null;
  isAdmin?: boolean;
  createdAt: Date;
}

const API_BASE_URL = 'http://localhost:3001/api';

// Token management
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    console.log('getToken - token exists:', !!token, token ? 'Token: ' + token.substring(0, 20) + '...' : 'No token');
    return token;
  }
  return null;
};

const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    console.log('setToken - storing token in localStorage');
    localStorage.setItem('authToken', token);
    console.log('setToken - token stored successfully');
  }
};

const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

export const authService = {
  // Register a new user
  register: async (email: string, password: string, displayName: string): Promise<User> => {
    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          displayName,
        }),
      });

      // Store token
      if (response.token) {
        setToken(response.token);
      }

      // Dispatch custom event to notify listeners
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('authStateChanged'));
      }

      return response.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Sign in existing user
  login: async (email: string, password: string): Promise<User> => {
    try {
      console.log('Attempting login for:', email);
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log('Login response:', response);

      // Store token
      if (response.token) {
        console.log('Storing token:', response.token.substring(0, 20) + '...');
        setToken(response.token);
        
        // Dispatch event to trigger auth state change
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('authStateChanged'));
        }
      }

      return response.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Sign out current user
  logout: async (): Promise<void> => {
    try {
      // Remove token
      removeToken();

      // Dispatch custom event to notify listeners
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('authStateChanged'));
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = getToken();
      console.log('getCurrentUser - token exists:', !!token);
      if (!token) {
        return null;
      }

      const response = await apiRequest('/auth/profile');
      console.log('getCurrentUser - profile response:', response);
      return response;
    } catch (error) {
      console.error('Error getting current user:', error);
      // If token is invalid, remove it
      removeToken();
      return null;
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    if (typeof window !== 'undefined') {
      const checkAuthState = async () => {
        try {
          const user = await authService.getCurrentUser();
          console.log('Auth state check - user:', user);
          callback(user);
        } catch (error) {
          console.log('Auth state check - error:', error);
          callback(null);
        }
      };

      // Initial check
      checkAuthState();

      // Listen for custom auth events
      const handleAuthChange = () => {
        console.log('Auth state changed event triggered');
        checkAuthState();
      };

      window.addEventListener('authStateChanged', handleAuthChange);

      // Return a cleanup function
      return () => {
        window.removeEventListener('authStateChanged', handleAuthChange);
        console.log('Auth state listener cleaned up');
      };
    }

    return () => {};
  },

  // Address management
  getAddresses: async (): Promise<any[]> => {
    try {
      console.log('Fetching addresses from server...');
      const addresses = await apiRequest('/auth/addresses');
      console.log('Received addresses from server:', addresses);
      return addresses;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  },

  addAddress: async (address: {
    type: string;
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  }): Promise<any> => {
    try {
      console.log('Adding address - sending to server:', address);
      const result = await apiRequest('/auth/addresses', {
        method: 'POST',
        body: JSON.stringify(address),
      });
      console.log('Add address result:', result);
      return result;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  },

  updateAddress: async (id: string, address: {
    type: string;
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  }): Promise<any> => {
    try {
      console.log('Updating address - ID:', id, 'Data:', address);
      const result = await apiRequest(`/auth/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(address),
      });
      console.log('Update address result:', result);
      return result;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  deleteAddress: async (id: string): Promise<any> => {
    try {
      console.log('Deleting address - ID:', id);
      const result = await apiRequest(`/auth/addresses/${id}`, {
        method: 'DELETE',
      });
      console.log('Delete address result:', result);
      return result;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },
};
