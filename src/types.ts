export interface Product {
  id: string;
  name: string;
  desc: string;
  price: number; // in CLP
  cat: 'cafes' | 'frias' | 'snacks' | 'combos';
  stock: boolean;
  icon: string; // Emoji representing the product
  customizable?: boolean;
}

export interface CustCustomization {
  size: 'Regular' | 'Grande';
  milk: 'Ninguna' | 'Entera' | 'Sin Lactosa' | 'Almendra';
  sweetness: 'Normal' | 'Menos Dulce' | 'Sin Azúcar';
}

export interface CartItem {
  id: string; // unique cart item id (product.id + customization string)
  product: Product;
  quantity: number;
  customization?: CustCustomization;
}

export type OrderStatus = 'Preparando' | 'Listo' | 'Entregado';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  pointsEarned: number;
  customerId: string; // RUT/ID or "Anónimo"
  customerName?: string;
  status: OrderStatus;
  timestamp: string;
  waitTime: number; // Estimated minutes
}

export interface LoyaltyMember {
  rut: string;
  name: string;
  points: number;
  faceData?: string; // Base64 snapshot of face for visual comparison/simulated recognition
}
