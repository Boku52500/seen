export interface CustomerAddress {
  id: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface CustomerProfile {
  uid: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  addresses: CustomerAddress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  customerUid: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  shippingAddress: CustomerAddress;
  billingAddress: CustomerAddress;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  trackingNumber?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}