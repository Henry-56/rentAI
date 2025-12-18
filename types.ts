export enum UserRole {
  OWNER = 'OWNER',
  RENTER = 'RENTER',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phoneNumber?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  pricePerDay: number;
  imageUrl: string;
  ownerId: string;
  location: string;
  coordinates: Coordinates;
  available: boolean;
  rating: number;
  reviewCount: number;
  distance?: number;
  isRentedToday?: boolean;
}

export type RentalStatus =
  | 'DRAFT'            // Borrador / En carrito
  | 'PENDING_PAYMENT'  // Pendiente de pago
  | 'IN_REVIEW'        // Pago realizado / En revisión
  | 'CONFIRMED'        // Confirmada
  | 'IN_PROGRESS'      // En curso
  | 'COMPLETED'        // Finalizada
  | 'CANCELLED';       // Cancelada

export interface RentalTransaction {
  id: string;
  itemId: string;
  itemTitle: string;    // Helper for display
  itemImage: string;    // Helper for display
  renterId: string;
  renterName: string;   // Helper for display
  ownerId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: RentalStatus;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface MonthlyIncome {
  month: string;
  amount: number;
}