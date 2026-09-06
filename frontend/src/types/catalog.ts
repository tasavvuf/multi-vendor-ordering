export type Vendor = {
  id: string;
  name: string;
  description?: string;
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  vendor: Vendor;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderItem = {
  productId: string;
  vendorId: string;
  productName: string;
  vendorName: string;
  quantity: number;
  unitPrice: string;
};

export type Order = {
  id: string;
  total: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

export type OrderSummary = Omit<Order, 'items'> & {
  itemCount: number;
};

export type VendorProductsResponse = {
  vendor: Vendor;
  products: Array<Omit<Product, 'vendor'> & { vendor?: Vendor }>;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
};
