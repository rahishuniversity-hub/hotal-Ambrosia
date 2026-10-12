/* ═══════════════════════════════════════════
   Admin Dashboard — TypeScript Types
   ═══════════════════════════════════════════ */

/* ── Booking ── */
export type BookingStatus = "pending" | "confirmed" | "checked-in" | "checked-out" | "cancelled";

export interface Booking {
  id: string;
  guestName: string;
  phone: string;
  email: string;
  roomType: "Silver" | "Gold";
  checkIn: string;   // ISO date string
  checkOut: string;   // ISO date string
  guests: number;
  status: BookingStatus;
  createdAt: string;  // ISO date string
  notes: string;
}

/* ── Room ── */
export type RoomStatus = "available" | "occupied" | "maintenance";

export interface Room {
  id: string;
  name: string;
  type: "Silver" | "Gold";
  price: { single: number; double: number };
  description: string;
  facilities: string[];
  images: string[];
  status: RoomStatus;
  createdAt: string;
}

/* ── Restaurant Menu ── */
export type MenuCategory =
  | "Mocktail"
  | "From The Chillers"
  | "Soup / Western"
  | "Fresh Healthy Salad & Papad"
  | "Indian Appetisers"
  | "Pan Asian Appetisers"
  | "Mexican Appetisers"
  | "Sizzler"
  | "Around The World"
  | "Chinese & Thai — Noodles & Rice"
  | "Italian Delights — Pasta"
  | "Italian Rust Pizza"
  | "Ambrosia Signature Dish"
  | "Main Course — Indian"
  | "Vegetable"
  | "Cheese"
  | "Kaju"
  | "Kofta"
  | "Assorted Indian Bread"
  | "Dal"
  | "Rice / Biryani / Pulao"
  | "Snack Sandwiches"
  | "Milkshake"
  | "Dessert"
  | "Starters"
  | "Main Course"
  | "Chinese"
  | "South Indian"
  | "Desserts"
  | "Beverages"
  | string;

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  image: string;
  available: boolean;
  createdAt: string;
}

/* ── Banquet ── */
export interface BanquetHall {
  id: string;
  name: string;
  capacity: number;
  price: number;
  description: string;
  images: string[];
  createdAt: string;
}

export type BanquetEnquiryStatus = "pending" | "confirmed" | "cancelled";

export interface BanquetEnquiry {
  id: string;
  hallId: string;
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  guests: number;
  message: string;
  status: BanquetEnquiryStatus;
  createdAt: string;
}

/* ── Gallery ── */
export interface GalleryItem {
  id: string;
  type: "image" | "video";
  url: string;
  title: string;
  category: string;
  visible: boolean;
  createdAt: string;
}


/* ── Contact Enquiries ── */
export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

/* ── Website Content ── */
export interface WebsiteContent {
  homepage: {
    title: string;
    subtitle: string;
    description: string;
  };
  about: {
    title: string;
    description: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
  };
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    pinterest: string;
  };
}

/* ── Admin Settings ── */
export interface AdminSettings {
  name: string;
  email: string;
  passwordHash: string;
}

/* ── Admin User (session-side, no hash) ── */
export interface AdminUser {
  name: string;
  email: string;
}

/* ── Dashboard Stats ── */
export interface DashboardStats {
  totalBookings: number;
  todayBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  checkedInBookings: number;
  totalEnquiries: number;
  unreadEnquiries: number;
  totalRooms: number;
  totalMenuItems: number;
  totalGalleryItems: number;
  totalOrders: number;
  activeOrders: number;
  recentBookings: Booking[];
  recentEnquiries: Enquiry[];
}

/* ── Restaurant Orders (Phase 1 Flow) ── */
export type OrderType = "dine-in" | "takeaway" | "delivery";

export type OrderStatus =
  | "new"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  category: MenuCategory | string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface RestaurantOrder {
  id: string;
  orderNumber: string;
  sessionId?: string;
  orderRound?: number;
  orderType: OrderType;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  tableNumber?: string;
  pickupTime?: string;
  deliveryAddress?: string;
  deliveryDistanceKm?: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

/* ── Dine-In Dining Sessions & Running Bill ── */
export type DiningSessionStatus = "active" | "finalized" | "closed";

export interface DiningSession {
  id: string;
  sessionNumber: string;
  billNumber?: string;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  status: DiningSessionStatus;
  orderIds: string[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface RunningBillItem {
  id: string;
  menuItemId: string;
  name: string;
  category: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  orders: { orderNumber: string; quantity: number; time: string; round?: number }[];
}

export interface RunningBill {
  session: DiningSession;
  orders: RestaurantOrder[];
  items: RunningBillItem[];
  subtotal: number;
  tax: number; // 5% GST
  totalAmount: number;
  billNumber: string;
  billDate: string;
}
