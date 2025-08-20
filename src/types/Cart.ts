import { Product } from './Product';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  selectedColorValue: string;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  shippingInfo: ShippingInfo;
  paymentInfo: Omit<PaymentInfo, 'cardNumber' | 'cvv'>; // Don't store sensitive data
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: Date;
}
