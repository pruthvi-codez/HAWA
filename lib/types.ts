export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
export type PaymentMethod = 'UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'COD';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
  low_stock_threshold: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  base_price: number;
  discount_price: number | null;
  images: string[];
  sizes: string[];
  colors: string[];
  material: string;
  care_instructions: string;
  sku_prefix: string;
  is_featured: boolean;
  is_published: boolean;
  rating_avg: number;
  rating_count: number;
  sold_count: number;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_slug?: string;
  variants?: ProductVariant[];
  total_stock?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  role: 'customer' | 'admin';
  status: 'active' | 'deactivated';
  email_verified: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface Address {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number;
  start_date: string | null;
  expiry_date: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  image: string | null;
  size: string | null;
  color: string | null;
  unit_price: number;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  subtotal: number;
  discount: number;
  coupon_code: string | null;
  shipping_charge: number;
  total_amount: number;
  status: OrderStatus;
  shipping_name: string;
  shipping_phone: string;
  shipping_address_line: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_method: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  courier_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
  user_name?: string;
  product_name?: string;
}

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  maxStock: number;
}
