import { Item, User, UserRole, RentalTransaction } from './types';

export const APP_NAME = "RentAI";

export const CATEGORIES = [
  "Todos",
  "Cámaras",
  "Drones",
  "Audio",
  "Herramientas",
  "Camping",
  "Gaming"
];

// Coordinates for Huancayo Center (Plaza Constitución)
export const HUANCAYO_CENTER = {
  lat: -12.0681, 
  lng: -75.2106
};

export const MOCK_USER_OWNER: User = {
  id: 'u1',
  name: 'Carlos Dueño',
  email: 'carlos@rentai.com',
  role: UserRole.OWNER,
  avatarUrl: 'https://picsum.photos/id/64/100/100',
  phoneNumber: '51999999999'
};

export const MOCK_USER_RENTER: User = {
  id: 'u2',
  name: 'Ana Arrendataria',
  email: 'ana@gmail.com',
  role: UserRole.RENTER,
  avatarUrl: 'https://picsum.photos/id/65/100/100'
};

export const MOCK_ITEMS: Item[] = [
  {
    id: 'i1',
    title: 'Sony Alpha a7 III Mirrorless',
    description: 'Cámara profesional full-frame, ideal para video 4K y fotografía nocturna. Incluye lente 28-70mm.',
    category: 'Cámaras',
    pricePerDay: 120,
    imageUrl: 'https://picsum.photos/id/250/800/600',
    ownerId: 'u1',
    location: 'El Tambo, Huancayo',
    coordinates: { lat: -12.0543, lng: -75.2150 },
    available: true,
    rating: 4.8,
    reviewCount: 42
  },
  {
    id: 'i2',
    title: 'DJI Mavic Air 2',
    description: 'Drone plegable con cámara 4K/60fps, fotos de 48MP y transmisión de video de 10km. Incluye 3 baterías.',
    category: 'Drones',
    pricePerDay: 85,
    imageUrl: 'https://picsum.photos/id/1/800/600', 
    ownerId: 'u3',
    location: 'San Carlos, Huancayo',
    coordinates: { lat: -12.0620, lng: -75.2020 },
    available: true,
    rating: 4.9,
    reviewCount: 15
  },
  {
    id: 'i3',
    title: 'Nintendo Switch OLED',
    description: 'Consola híbrida con pantalla OLED de 7 pulgadas. Incluye Mario Kart 8 y Zelda BOTW.',
    category: 'Gaming',
    pricePerDay: 40,
    imageUrl: 'https://picsum.photos/id/96/800/600',
    ownerId: 'u1',
    location: 'Chilca, Huancayo',
    coordinates: { lat: -12.0850, lng: -75.2100 }, 
    available: false,
    rating: 4.5,
    reviewCount: 8
  },
  {
    id: 'i4',
    title: 'Carpa 4 Estaciones North Face',
    description: 'Carpa resistente para alta montaña. Capacidad 3 personas. Impermeable y ligera.',
    category: 'Camping',
    pricePerDay: 55,
    imageUrl: 'https://picsum.photos/id/449/800/600',
    ownerId: 'u4',
    location: 'Pilcomayo, Huancayo',
    coordinates: { lat: -12.0550, lng: -75.2350 },
    available: true,
    rating: 4.7,
    reviewCount: 23
  },
  {
    id: 'i5',
    title: 'Proyector Epson Home Cinema',
    description: 'Full HD 1080p, 3000 lúmenes. Perfecto para cine en casa o presentaciones.',
    category: 'Audio',
    pricePerDay: 60,
    imageUrl: 'https://picsum.photos/id/180/800/600',
    ownerId: 'u1',
    location: 'Centro, Huancayo',
    coordinates: { lat: -12.0681, lng: -75.2106 },
    available: true,
    rating: 4.6,
    reviewCount: 12
  }
];

export const MOCK_RENTALS: RentalTransaction[] = [
  {
    id: 'r1',
    itemId: 'i1',
    itemTitle: 'Sony Alpha a7 III Mirrorless',
    itemImage: 'https://picsum.photos/id/250/800/600',
    renterId: 'u2',
    renterName: 'Ana Arrendataria',
    ownerId: 'u1',
    startDate: '2024-05-20',
    endDate: '2024-05-22',
    totalPrice: 360,
    status: 'PENDING_PAYMENT',
    createdAt: Date.now() - 100000
  },
  {
    id: 'r2',
    itemId: 'i5',
    itemTitle: 'Proyector Epson Home Cinema',
    itemImage: 'https://picsum.photos/id/180/800/600',
    renterId: 'u2',
    renterName: 'Ana Arrendataria',
    ownerId: 'u1',
    startDate: '2024-05-25',
    endDate: '2024-05-26',
    totalPrice: 60,
    status: 'IN_REVIEW',
    createdAt: Date.now() - 200000
  },
  {
    id: 'r3',
    itemId: 'i3',
    itemTitle: 'Nintendo Switch OLED',
    itemImage: 'https://picsum.photos/id/96/800/600',
    renterId: 'u5',
    renterName: 'Pedro Gamer',
    ownerId: 'u1',
    startDate: '2024-05-18',
    endDate: '2024-05-25',
    totalPrice: 280,
    status: 'IN_PROGRESS',
    createdAt: Date.now() - 500000
  },
  {
    id: 'r4',
    itemId: 'i2',
    itemTitle: 'DJI Mavic Air 2',
    itemImage: 'https://picsum.photos/id/1/800/600', 
    renterId: 'u2',
    renterName: 'Ana Arrendataria',
    ownerId: 'u3',
    startDate: '2024-04-10',
    endDate: '2024-04-12',
    totalPrice: 170,
    status: 'COMPLETED',
    createdAt: Date.now() - 10000000
  }
];