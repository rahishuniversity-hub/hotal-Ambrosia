/* ═══════════════════════════════════════════
   Admin Dashboard — Supabase Data Store
   Real Supabase CRUD for all hotel data
   ═══════════════════════════════════════════ */

import { supabase } from "./supabase";
import type {
  Booking,
  Room,
  MenuItem,
  BanquetHall,
  BanquetEnquiry,
  GalleryItem,
  Enquiry,
  WebsiteContent,
  AdminSettings,
  DashboardStats,
  RestaurantOrder,
  OrderStatus,
  DiningSession,
  DiningSessionStatus,
  RunningBillItem,
  RunningBill,
} from "./types";
import { hashPassword } from "./auth";
import { AMBROSIA_MENU_ITEMS } from "./menuData";

/* ── Mappers for DB snake_case <-> Frontend camelCase ── */

function mapBookingFromDb(row: any): Booking {
  return {
    id: row.id,
    guestName: row.guest_name,
    phone: row.phone,
    email: row.email,
    roomType: row.room_type,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guests: Number(row.guests) || 1,
    status: row.status,
    notes: row.notes || "",
    createdAt: row.created_at,
  };
}

function mapBookingToDb(b: Partial<Booking>): any {
  const mapped: any = {};
  if (b.id !== undefined) mapped.id = b.id;
  if (b.guestName !== undefined) mapped.guest_name = b.guestName;
  if (b.phone !== undefined) mapped.phone = b.phone;
  if (b.email !== undefined) mapped.email = b.email;
  if (b.roomType !== undefined) mapped.room_type = b.roomType;
  if (b.checkIn !== undefined) mapped.check_in = b.checkIn;
  if (b.checkOut !== undefined) mapped.check_out = b.checkOut;
  if (b.guests !== undefined) mapped.guests = Number(b.guests);
  if (b.status !== undefined) mapped.status = b.status;
  if (b.notes !== undefined) mapped.notes = b.notes;
  return mapped;
}

function mapRoomFromDb(row: any): Room {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    price: typeof row.price === "string" ? JSON.parse(row.price) : row.price,
    description: row.description || "",
    facilities: Array.isArray(row.facilities)
      ? row.facilities
      : typeof row.facilities === "string"
      ? JSON.parse(row.facilities)
      : [],
    images: Array.isArray(row.images)
      ? row.images
      : typeof row.images === "string"
      ? JSON.parse(row.images)
      : [],
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapRoomToDb(r: Partial<Room>): any {
  const mapped: any = {};
  if (r.id !== undefined) mapped.id = r.id;
  if (r.name !== undefined) mapped.name = r.name;
  if (r.type !== undefined) mapped.type = r.type;
  if (r.price !== undefined) mapped.price = r.price;
  if (r.description !== undefined) mapped.description = r.description;
  if (r.facilities !== undefined) mapped.facilities = r.facilities;
  if (r.images !== undefined) mapped.images = r.images;
  if (r.status !== undefined) mapped.status = r.status;
  return mapped;
}

function mapMenuItemFromDb(row: any): MenuItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    description: row.description || "",
    image: row.image || "",
    available: row.available !== false,
    createdAt: row.created_at,
  };
}

function mapMenuItemToDb(m: Partial<MenuItem>): any {
  const mapped: any = {};
  if (m.id !== undefined) mapped.id = m.id;
  if (m.name !== undefined) mapped.name = m.name;
  if (m.category !== undefined) mapped.category = m.category;
  if (m.price !== undefined) mapped.price = Number(m.price);
  if (m.description !== undefined) mapped.description = m.description;
  if (m.image !== undefined) mapped.image = m.image;
  if (m.available !== undefined) mapped.available = m.available;
  return mapped;
}

function mapBanquetHallFromDb(row: any): BanquetHall {
  return {
    id: row.id,
    name: row.name,
    capacity: Number(row.capacity),
    price: Number(row.price),
    description: row.description || "",
    images: Array.isArray(row.images)
      ? row.images
      : typeof row.images === "string"
      ? JSON.parse(row.images)
      : [],
    createdAt: row.created_at,
  };
}

function mapBanquetEnquiryFromDb(row: any): BanquetEnquiry {
  return {
    id: row.id,
    hallId: row.hall_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    eventType: row.event_type,
    eventDate: row.event_date,
    guests: Number(row.guests),
    message: row.message || "",
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapBanquetEnquiryToDb(be: Partial<BanquetEnquiry>): any {
  const mapped: any = {};
  if (be.id !== undefined) mapped.id = be.id;
  if (be.hallId !== undefined) mapped.hall_id = be.hallId;
  if (be.name !== undefined) mapped.name = be.name;
  if (be.phone !== undefined) mapped.phone = be.phone;
  if (be.email !== undefined) mapped.email = be.email;
  if (be.eventType !== undefined) mapped.event_type = be.eventType;
  if (be.eventDate !== undefined) mapped.event_date = be.eventDate;
  if (be.guests !== undefined) mapped.guests = Number(be.guests);
  if (be.message !== undefined) mapped.message = be.message;
  if (be.status !== undefined) mapped.status = be.status;
  return mapped;
}

function mapGalleryItemFromDb(row: any): GalleryItem {
  return {
    id: row.id,
    type: row.type,
    url: row.url,
    title: row.title,
    category: row.category,
    visible: row.visible !== false,
    createdAt: row.created_at,
  };
}

function mapGalleryItemToDb(g: Partial<GalleryItem>): any {
  const mapped: any = {};
  if (g.id !== undefined) mapped.id = g.id;
  if (g.type !== undefined) mapped.type = g.type;
  if (g.url !== undefined) mapped.url = g.url;
  if (g.title !== undefined) mapped.title = g.title;
  if (g.category !== undefined) mapped.category = g.category;
  if (g.visible !== undefined) mapped.visible = g.visible;
  return mapped;
}



function mapEnquiryFromDb(row: any): Enquiry {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    message: row.message || "",
    read: !!row.read,
    createdAt: row.created_at,
  };
}

function mapEnquiryToDb(e: Partial<Enquiry>): any {
  const mapped: any = {};
  if (e.id !== undefined) mapped.id = e.id;
  if (e.name !== undefined) mapped.name = e.name;
  if (e.phone !== undefined) mapped.phone = e.phone;
  if (e.email !== undefined) mapped.email = e.email;
  if (e.message !== undefined) mapped.message = e.message;
  if (e.read !== undefined) mapped.read = e.read;
  return mapped;
}

function mapRestaurantOrderFromDb(row: any): RestaurantOrder {
  return {
    id: row.id,
    orderNumber: row.order_number || row.id,
    sessionId: row.session_id || undefined,
    orderRound: Number(row.order_round) || 1,
    orderType: row.order_type || "dine-in",
    status: row.status || "new",
    customerName: row.customer_name || "",
    customerPhone: row.customer_phone || "",
    customerEmail: row.customer_email || "",
    tableNumber: row.table_number || "",
    pickupTime: row.pickup_time || "",
    deliveryAddress: row.delivery_address || "",
    deliveryDistanceKm: Number(row.delivery_distance_km) || 0,
    items: Array.isArray(row.items)
      ? row.items
      : typeof row.items === "string"
      ? JSON.parse(row.items)
      : [],
    subtotal: Number(row.subtotal) || 0,
    tax: Number(row.tax) || 0,
    deliveryFee: Number(row.delivery_fee) || 0,
    totalAmount: Number(row.total_amount) || 0,
    specialInstructions: row.special_instructions || "",
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
  };
}

function mapRestaurantOrderToDb(o: Partial<RestaurantOrder>): any {
  const mapped: any = {};
  if (o.id !== undefined) mapped.id = o.id;
  if (o.orderNumber !== undefined) mapped.order_number = o.orderNumber;
  if (o.sessionId !== undefined) mapped.session_id = o.sessionId;
  if (o.orderRound !== undefined) mapped.order_round = o.orderRound;
  if (o.orderType !== undefined) mapped.order_type = o.orderType;
  if (o.status !== undefined) mapped.status = o.status;
  if (o.customerName !== undefined) mapped.customer_name = o.customerName;
  if (o.customerPhone !== undefined) mapped.customer_phone = o.customerPhone;
  if (o.customerEmail !== undefined) mapped.customer_email = o.customerEmail;
  if (o.tableNumber !== undefined) mapped.table_number = o.tableNumber;
  if (o.pickupTime !== undefined) mapped.pickup_time = o.pickupTime;
  if (o.deliveryAddress !== undefined) mapped.delivery_address = o.deliveryAddress;
  if (o.deliveryDistanceKm !== undefined) mapped.delivery_distance_km = Number(o.deliveryDistanceKm);
  if (o.items !== undefined) mapped.items = o.items;
  if (o.subtotal !== undefined) mapped.subtotal = Number(o.subtotal);
  if (o.tax !== undefined) mapped.tax = Number(o.tax);
  if (o.deliveryFee !== undefined) mapped.delivery_fee = Number(o.deliveryFee);
  if (o.totalAmount !== undefined) mapped.total_amount = Number(o.totalAmount);
  if (o.specialInstructions !== undefined) mapped.special_instructions = o.specialInstructions;
  if (o.updatedAt !== undefined) mapped.updated_at = o.updatedAt;
  return mapped;
}

function mapDiningSessionFromDb(row: any): DiningSession {
  return {
    id: row.id,
    sessionNumber: row.session_number || row.id,
    billNumber: row.bill_number || "",
    tableNumber: row.table_number || "",
    customerName: row.customer_name || "",
    customerPhone: row.customer_phone || "",
    customerEmail: row.customer_email || "",
    status: (row.status as DiningSessionStatus) || "active",
    orderIds: Array.isArray(row.order_ids)
      ? row.order_ids
      : typeof row.order_ids === "string"
      ? JSON.parse(row.order_ids)
      : [],
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
    closedAt: row.closed_at || undefined,
  };
}

function mapDiningSessionToDb(s: Partial<DiningSession>): any {
  const mapped: any = {};
  if (s.id !== undefined) mapped.id = s.id;
  if (s.sessionNumber !== undefined) mapped.session_number = s.sessionNumber;
  if (s.billNumber !== undefined) mapped.bill_number = s.billNumber;
  if (s.tableNumber !== undefined) mapped.table_number = s.tableNumber;
  if (s.customerName !== undefined) mapped.customer_name = s.customerName;
  if (s.customerPhone !== undefined) mapped.customer_phone = s.customerPhone;
  if (s.customerEmail !== undefined) mapped.customer_email = s.customerEmail;
  if (s.status !== undefined) mapped.status = s.status;
  if (s.orderIds !== undefined) mapped.order_ids = s.orderIds;
  if (s.updatedAt !== undefined) mapped.updated_at = s.updatedAt;
  if (s.closedAt !== undefined) mapped.closed_at = s.closedAt;
  return mapped;
}

export class AdminStore {
  constructor() {
    this.cleanLegacyDummyData();
  }

  // Clear any legacy dummy bookings or enquiries stored in localStorage
  private cleanLegacyDummyData() {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem("ha-bookings");
      localStorage.removeItem("ha-enquiries");
      localStorage.removeItem("ha-banquet-enquiries");
    } catch {
      // Ignore if localStorage not accessible
    }
  }

  // ═══════════════════════════════════════════
  // 1. BOOKINGS (Real Supabase Queries)
  // ═══════════════════════════════════════════

  async getBookings(): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase getBookings error:", error.message);
        return [];
      }
      return (data || []).map(mapBookingFromDb);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      return [];
    }
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) return undefined;
      return mapBookingFromDb(data);
    } catch {
      return undefined;
    }
  }

  async addBooking(booking: Omit<Booking, "id" | "createdAt">): Promise<Booking | null> {
    try {
      const id = `bk-${Date.now()}`;
      const payload = {
        ...mapBookingToDb(booking),
        id,
      };

      const { data, error } = await supabase
        .from("bookings")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Supabase addBooking error:", error.message);
        return null;
      }
      return mapBookingFromDb(data);
    } catch (err) {
      console.error("Failed to add booking:", err);
      return null;
    }
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    try {
      const payload = mapBookingToDb(updates);
      const { data, error } = await supabase
        .from("bookings")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase updateBooking error:", error.message);
        return null;
      }
      return mapBookingFromDb(data);
    } catch (err) {
      console.error("Failed to update booking:", err);
      return null;
    }
  }

  async deleteBooking(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) {
        console.error("Supabase deleteBooking error:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Failed to delete booking:", err);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // 2. ROOMS (Real Supabase Queries)
  // ═══════════════════════════════════════════

  async getRooms(): Promise<Room[]> {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Supabase getRooms error:", error.message);
        return [];
      }
      return (data || []).map(mapRoomFromDb);
    } catch (err) {
      console.error("Failed to get rooms:", err);
      return [];
    }
  }

  async getRoomById(id: string): Promise<Room | undefined> {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) return undefined;
      return mapRoomFromDb(data);
    } catch {
      return undefined;
    }
  }

  async addRoom(room: Omit<Room, "id" | "createdAt">): Promise<Room | null> {
    try {
      const id = `room-${Date.now()}`;
      const payload = {
        ...mapRoomToDb(room),
        id,
      };

      const { data, error } = await supabase
        .from("rooms")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Supabase addRoom error:", error.message);
        return null;
      }
      return mapRoomFromDb(data);
    } catch (err) {
      console.error("Failed to add room:", err);
      return null;
    }
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room | null> {
    try {
      const payload = mapRoomToDb(updates);
      const { data, error } = await supabase
        .from("rooms")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase updateRoom error:", error.message);
        return null;
      }
      return mapRoomFromDb(data);
    } catch (err) {
      console.error("Failed to update room:", err);
      return null;
    }
  }

  async deleteRoom(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("rooms").delete().eq("id", id);
      if (error) {
        console.error("Supabase deleteRoom error:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Failed to delete room:", err);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // 3. MENU ITEMS (Real Supabase Queries)
  // ═══════════════════════════════════════════

  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("created_at", { ascending: true });

      if (error || !data || data.length < 50) {
        if (error) console.error("Supabase getMenuItems error:", error.message);
        return AMBROSIA_MENU_ITEMS;
      }
      return data.map(mapMenuItemFromDb);
    } catch (err) {
      console.error("Failed to get menu items:", err);
      return AMBROSIA_MENU_ITEMS;
    }
  }

  async addMenuItem(item: Omit<MenuItem, "id" | "createdAt">): Promise<MenuItem | null> {
    try {
      const id = `m-${Date.now()}`;
      const payload = {
        ...mapMenuItemToDb(item),
        id,
      };

      const { data, error } = await supabase
        .from("menu_items")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Supabase addMenuItem error:", error.message);
        return null;
      }
      return mapMenuItemFromDb(data);
    } catch (err) {
      console.error("Failed to add menu item:", err);
      return null;
    }
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    try {
      const payload = mapMenuItemToDb(updates);
      const { data, error } = await supabase
        .from("menu_items")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase updateMenuItem error:", error.message);
        return null;
      }
      return mapMenuItemFromDb(data);
    } catch (err) {
      console.error("Failed to update menu item:", err);
      return null;
    }
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) {
        console.error("Supabase deleteMenuItem error:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Failed to delete menu item:", err);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // 4. BANQUET HALLS & ENQUIRIES (Real Supabase)
  // ═══════════════════════════════════════════

  async getBanquetHalls(): Promise<BanquetHall[]> {
    try {
      const { data, error } = await supabase
        .from("banquet_halls")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Supabase getBanquetHalls error:", error.message);
        return [];
      }
      return (data || []).map(mapBanquetHallFromDb);
    } catch (err) {
      console.error("Failed to get banquet halls:", err);
      return [];
    }
  }

  async getBanquetEnquiries(): Promise<BanquetEnquiry[]> {
    try {
      const { data, error } = await supabase
        .from("banquet_enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase getBanquetEnquiries error:", error.message);
        return [];
      }
      return (data || []).map(mapBanquetEnquiryFromDb);
    } catch (err) {
      console.error("Failed to get banquet enquiries:", err);
      return [];
    }
  }

  async addBanquetEnquiry(
    enquiry: Omit<BanquetEnquiry, "id" | "createdAt">
  ): Promise<BanquetEnquiry | null> {
    try {
      const id = `be-${Date.now()}`;
      const payload = {
        ...mapBanquetEnquiryToDb(enquiry),
        id,
      };

      const { data, error } = await supabase
        .from("banquet_enquiries")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Supabase addBanquetEnquiry error:", error.message);
        return null;
      }
      return mapBanquetEnquiryFromDb(data);
    } catch (err) {
      console.error("Failed to add banquet enquiry:", err);
      return null;
    }
  }

  async updateBanquetEnquiry(
    id: string,
    updates: Partial<BanquetEnquiry>
  ): Promise<BanquetEnquiry | null> {
    try {
      const payload = mapBanquetEnquiryToDb(updates);
      const { data, error } = await supabase
        .from("banquet_enquiries")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase updateBanquetEnquiry error:", error.message);
        return null;
      }
      return mapBanquetEnquiryFromDb(data);
    } catch (err) {
      console.error("Failed to update banquet enquiry:", err);
      return null;
    }
  }

  async deleteBanquetEnquiry(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("banquet_enquiries").delete().eq("id", id);
      if (error) {
        console.error("Supabase deleteBanquetEnquiry error:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Failed to delete banquet enquiry:", err);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // 5. GALLERY ITEMS (Real Supabase Queries)
  // ═══════════════════════════════════════════

  async getGalleryItems(): Promise<GalleryItem[]> {
    try {
      const { data, error } = await supabase
        .from("gallery_items")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Supabase getGalleryItems error:", error.message);
        return [];
      }
      return (data || []).map(mapGalleryItemFromDb);
    } catch (err) {
      console.error("Failed to get gallery items:", err);
      return [];
    }
  }

  async addGalleryItem(item: Omit<GalleryItem, "id" | "createdAt">): Promise<GalleryItem | null> {
    try {
      const id = `g-${Date.now()}`;
      const payload = {
        ...mapGalleryItemToDb(item),
        id,
      };

      const { data, error } = await supabase
        .from("gallery_items")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Supabase addGalleryItem error:", error.message);
        return null;
      }
      return mapGalleryItemFromDb(data);
    } catch (err) {
      console.error("Failed to add gallery item:", err);
      return null;
    }
  }

  async updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem | null> {
    try {
      const payload = mapGalleryItemToDb(updates);
      const { data, error } = await supabase
        .from("gallery_items")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase updateGalleryItem error:", error.message);
        return null;
      }
      return mapGalleryItemFromDb(data);
    } catch (err) {
      console.error("Failed to update gallery item:", err);
      return null;
    }
  }

  async deleteGalleryItem(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("gallery_items").delete().eq("id", id);
      if (error) {
        console.error("Supabase deleteGalleryItem error:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Failed to delete gallery item:", err);
      return false;
    }
  }



  // ═══════════════════════════════════════════
  // 7. ENQUIRIES (Real Supabase Queries)
  // ═══════════════════════════════════════════

  async getEnquiries(): Promise<Enquiry[]> {
    try {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase getEnquiries error:", error.message);
        return [];
      }
      return (data || []).map(mapEnquiryFromDb);
    } catch (err) {
      console.error("Failed to get enquiries:", err);
      return [];
    }
  }

  async addEnquiry(enquiry: Omit<Enquiry, "id" | "createdAt">): Promise<Enquiry | null> {
    try {
      const id = `enq-${Date.now()}`;
      const payload = {
        ...mapEnquiryToDb(enquiry),
        id,
      };

      const { data, error } = await supabase
        .from("enquiries")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Supabase addEnquiry error:", error.message);
        return null;
      }
      return mapEnquiryFromDb(data);
    } catch (err) {
      console.error("Failed to add enquiry:", err);
      return null;
    }
  }

  async updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<Enquiry | null> {
    try {
      const payload = mapEnquiryToDb(updates);
      const { data, error } = await supabase
        .from("enquiries")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase updateEnquiry error:", error.message);
        return null;
      }
      return mapEnquiryFromDb(data);
    } catch (err) {
      console.error("Failed to update enquiry:", err);
      return null;
    }
  }

  async deleteEnquiry(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("enquiries").delete().eq("id", id);
      if (error) {
        console.error("Supabase deleteEnquiry error:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Failed to delete enquiry:", err);
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // 8. WEBSITE CONTENT (Real Supabase Queries)
  // ═══════════════════════════════════════════

  async getWebsiteContent(): Promise<WebsiteContent | null> {
    try {
      const { data, error } = await supabase
        .from("website_content")
        .select("content")
        .eq("id", "main")
        .single();

      if (error || !data) return null;
      return data.content as WebsiteContent;
    } catch {
      return null;
    }
  }

  async updateWebsiteContent(content: Partial<WebsiteContent>): Promise<boolean> {
    try {
      const current = (await this.getWebsiteContent()) || {};
      const updated = { ...current, ...content };

      const { error } = await supabase
        .from("website_content")
        .upsert({ id: "main", content: updated });

      return !error;
    } catch {
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // 9. ADMIN SETTINGS (Settings Management)
  // ═══════════════════════════════════════════

  getAdminSettings(): AdminSettings | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("ha-admin-settings");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async updateAdminSettings(settings: {
    name?: string;
    email?: string;
    newPassword?: string;
  }): Promise<boolean> {
    const current = this.getAdminSettings();
    const updated: AdminSettings = {
      name: settings.name || current?.name || "Hotel Ambrosia Admin",
      email: settings.email || current?.email || "admin@hotel-ambrosia.com",
      passwordHash: settings.newPassword
        ? await hashPassword(settings.newPassword)
        : current?.passwordHash || "",
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("ha-admin-settings", JSON.stringify(updated));
    }

    if (settings.newPassword) {
      try {
        await supabase.auth.updateUser({ password: settings.newPassword });
      } catch (err) {
        console.warn("Could not update Supabase password:", err);
      }
    }

    return true;
  }

  // ═══════════════════════════════════════════
  // 11. RESTAURANT ORDERS (Phase 1 Ordering)
  // ═══════════════════════════════════════════

  private inMemoryOrders: RestaurantOrder[] = [];

  private getLocalOrders(): RestaurantOrder[] {
    if (typeof window === "undefined") return this.inMemoryOrders;
    try {
      const raw = localStorage.getItem("ha-restaurant-orders");
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private setLocalOrders(orders: RestaurantOrder[]) {
    if (typeof window === "undefined") {
      this.inMemoryOrders = orders;
      return;
    }
    try {
      localStorage.setItem("ha-restaurant-orders", JSON.stringify(orders));
    } catch {
      // Ignore
    }
  }

  async getRestaurantOrders(): Promise<RestaurantOrder[]> {
    try {
      const { data, error } = await supabase
        .from("restaurant_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Fallback to local cache if table not created yet
        return this.getLocalOrders();
      }
      const remoteOrders = (data || []).map(mapRestaurantOrderFromDb);
      // Cache locally
      this.setLocalOrders(remoteOrders);
      return remoteOrders;
    } catch {
      return this.getLocalOrders();
    }
  }

  async getRestaurantOrderById(id: string): Promise<RestaurantOrder | undefined> {
    try {
      const { data, error } = await supabase
        .from("restaurant_orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        const local = this.getLocalOrders();
        return local.find((o) => o.id === id || o.orderNumber === id);
      }
      return mapRestaurantOrderFromDb(data);
    } catch {
      const local = this.getLocalOrders();
      return local.find((o) => o.id === id || o.orderNumber === id);
    }
  }

  async createRestaurantOrder(
    order: Omit<RestaurantOrder, "id" | "createdAt" | "updatedAt">
  ): Promise<RestaurantOrder | null> {
    const now = new Date().toISOString();
    const id = `ord-${Date.now()}`;

    // If dine-in order, associate with active session or create one
    let targetSession: DiningSession | null = null;
    if (order.orderType === "dine-in" && order.tableNumber) {
      if (order.sessionId) {
        targetSession = await this.getDiningSessionById(order.sessionId);
      }
      if (!targetSession || targetSession.status === "closed") {
        targetSession = await this.getActiveSessionByTable(order.tableNumber);
      }
      if (!targetSession) {
        targetSession = await this.createDiningSession({
          tableNumber: order.tableNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
        });
      }
    }

    const orderRound = targetSession
      ? (targetSession.orderIds?.length || 0) + 1
      : (order.orderRound || 1);

    const newOrder: RestaurantOrder = {
      ...order,
      id,
      sessionId: targetSession ? targetSession.id : order.sessionId,
      orderRound,
      createdAt: now,
      updatedAt: now,
    };

    // Save to local cache immediately
    const currentOrders = this.getLocalOrders();
    this.setLocalOrders([newOrder, ...currentOrders]);

    // Cross-tab notification of newly created order
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("hotel_ambrosia_orders");
        bc.postMessage({ type: "NEW_ORDER", order: newOrder });
        bc.close();
      } catch {
        // Ignore
      }
    }

    // If session present, append order to session
    if (targetSession) {
      await this.addOrderToDiningSession(targetSession.id, id);
    }

    try {
      const payload = {
        ...mapRestaurantOrderToDb(newOrder),
        id,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from("restaurant_orders")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.warn("Supabase restaurant_orders insert warning (using local fallback):", error.message);
        return newOrder;
      }
      return mapRestaurantOrderFromDb(data);
    } catch (err) {
      console.warn("Using local order fallback:", err);
      return newOrder;
    }
  }

  async updateRestaurantOrderStatus(
    id: string,
    status: OrderStatus
  ): Promise<RestaurantOrder | null> {
    const now = new Date().toISOString();

    // Update local store
    const local = this.getLocalOrders();
    const idx = local.findIndex((o) => o.id === id);
    let updatedLocalOrder: RestaurantOrder | null = null;
    if (idx !== -1) {
      local[idx] = { ...local[idx], status, updatedAt: now };
      updatedLocalOrder = local[idx];
      this.setLocalOrders([...local]);

      // Cross-tab broadcast of updated order
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const bc = new BroadcastChannel("hotel_ambrosia_orders");
          bc.postMessage({ type: "ORDER_UPDATED", order: updatedLocalOrder });
          bc.close();
        } catch {
          // Ignore
        }
      }
    }

    try {
      const { data, error } = await supabase
        .from("restaurant_orders")
        .update({ status, updated_at: now })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.warn("Supabase status update warning (using local fallback):", error.message);
        return updatedLocalOrder;
      }
      return mapRestaurantOrderFromDb(data);
    } catch {
      return updatedLocalOrder;
    }
  }

  subscribeToRestaurantOrders(
    callback: (order: RestaurantOrder, eventType: "INSERT" | "UPDATE") => void
  ): () => void {
    // 1. Supabase Realtime channel with unique name so multiple listeners (e.g. AdminShell and OrdersPage) do not collide
    const channelId = `restaurant-orders-live-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase.channel(channelId);

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "restaurant_orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const mapped = mapRestaurantOrderFromDb(payload.new);
            callback(mapped, "INSERT");
          } else if (payload.eventType === "UPDATE") {
            const mapped = mapRestaurantOrderFromDb(payload.new);
            callback(mapped, "UPDATE");
          }
        }
      )
      .subscribe();

    // 2. BroadcastChannel cross-tab fallback
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("hotel_ambrosia_orders");
      bc.onmessage = (event) => {
        if (event.data?.type === "NEW_ORDER" && event.data.order) {
          callback(event.data.order, "INSERT");
        } else if (event.data?.type === "ORDER_UPDATED" && event.data.order) {
          callback(event.data.order, "UPDATE");
        }
      };
    }

    // Cleanup unsubscriber
    return () => {
      supabase.removeChannel(channel);
      if (bc) bc.close();
    };
  }

  // ═══════════════════════════════════════════
  // 9B. DINE-IN DINING SESSIONS & RUNNING BILLS
  // ═══════════════════════════════════════════

  private inMemorySessions: DiningSession[] = [];

  private getLocalSessions(): DiningSession[] {
    if (typeof window === "undefined") return this.inMemorySessions;
    try {
      const raw = localStorage.getItem("ha-dining-sessions");
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private setLocalSessions(sessions: DiningSession[]) {
    if (typeof window === "undefined") {
      this.inMemorySessions = sessions;
      return;
    }
    try {
      localStorage.setItem("ha-dining-sessions", JSON.stringify(sessions));
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("hotel_ambrosia_sessions");
        bc.postMessage({ type: "SYNC_SESSIONS", sessions });
        bc.close();
      }
    } catch {
      // Ignore
    }
  }

  async getDiningSessions(): Promise<DiningSession[]> {
    try {
      const { data, error } = await supabase
        .from("dining_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return this.getLocalSessions();
      }
      const remote = (data || []).map(mapDiningSessionFromDb);
      this.setLocalSessions(remote);
      return remote;
    } catch {
      return this.getLocalSessions();
    }
  }

  async getActiveDiningSessions(): Promise<DiningSession[]> {
    const all = await this.getDiningSessions();
    return all.filter((s) => s.status === "active" || s.status === "finalized");
  }

  async getActiveSessionByTable(tableNumber: string): Promise<DiningSession | null> {
    const active = await this.getActiveDiningSessions();
    return (
      active.find(
        (s) => s.tableNumber.trim().toLowerCase() === tableNumber.trim().toLowerCase()
      ) || null
    );
  }

  async getDiningSessionById(id: string): Promise<DiningSession | null> {
    try {
      const { data, error } = await supabase
        .from("dining_sessions")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        const local = this.getLocalSessions();
        return local.find((s) => s.id === id || s.sessionNumber === id) || null;
      }
      return mapDiningSessionFromDb(data);
    } catch {
      const local = this.getLocalSessions();
      return local.find((s) => s.id === id || s.sessionNumber === id) || null;
    }
  }

  async createDiningSession(data: {
    tableNumber: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
  }): Promise<DiningSession> {
    const now = new Date().toISOString();
    const id = `ses-${Date.now()}`;
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const sessionNumber = `SES-${randomDigits}`;

    const newSession: DiningSession = {
      id,
      sessionNumber,
      billNumber: `AMB-BILL-${randomDigits}`,
      tableNumber: data.tableNumber,
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.trim(),
      customerEmail: data.customerEmail?.trim() || "",
      status: "active",
      orderIds: [],
      createdAt: now,
      updatedAt: now,
    };

    // Save locally
    const current = this.getLocalSessions();
    this.setLocalSessions([newSession, ...current]);

    try {
      const payload = {
        ...mapDiningSessionToDb(newSession),
        id,
        created_at: now,
        updated_at: now,
      };

      const { data: dbData, error } = await supabase
        .from("dining_sessions")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.warn("Supabase dining_sessions insert warning (using local fallback):", error.message);
        return newSession;
      }
      return mapDiningSessionFromDb(dbData);
    } catch (err) {
      console.warn("Using local dining session fallback:", err);
      return newSession;
    }
  }

  async addOrderToDiningSession(sessionId: string, orderId: string): Promise<DiningSession | null> {
    const now = new Date().toISOString();
    const local = this.getLocalSessions();
    const idx = local.findIndex((s) => s.id === sessionId);
    let updatedSession: DiningSession | null = null;

    if (idx !== -1) {
      const orderIds = Array.from(new Set([...(local[idx].orderIds || []), orderId]));
      local[idx] = { ...local[idx], orderIds, updatedAt: now };
      updatedSession = local[idx];
      this.setLocalSessions([...local]);
    }

    try {
      const current = await this.getDiningSessionById(sessionId);
      if (!current) return updatedSession;
      const orderIds = Array.from(new Set([...(current.orderIds || []), orderId]));

      const { data, error } = await supabase
        .from("dining_sessions")
        .update({ order_ids: orderIds, updated_at: now })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) {
        return updatedSession;
      }
      return mapDiningSessionFromDb(data);
    } catch {
      return updatedSession;
    }
  }

  async finalizeDiningSession(sessionId: string): Promise<DiningSession | null> {
    const now = new Date().toISOString();
    const local = this.getLocalSessions();
    const idx = local.findIndex((s) => s.id === sessionId);
    let updated: DiningSession | null = null;

    if (idx !== -1) {
      local[idx] = {
        ...local[idx],
        status: "finalized",
        updatedAt: now,
      };
      updated = local[idx];
      this.setLocalSessions([...local]);
    }

    try {
      const { data, error } = await supabase
        .from("dining_sessions")
        .update({ status: "finalized", updated_at: now })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) return updated;
      return mapDiningSessionFromDb(data);
    } catch {
      return updated;
    }
  }

  async closeDiningSession(sessionId: string): Promise<DiningSession | null> {
    const now = new Date().toISOString();
    const local = this.getLocalSessions();
    const idx = local.findIndex((s) => s.id === sessionId);
    let updated: DiningSession | null = null;

    if (idx !== -1) {
      local[idx] = {
        ...local[idx],
        status: "closed",
        closedAt: now,
        updatedAt: now,
      };
      updated = local[idx];
      this.setLocalSessions([...local]);
    }

    try {
      const { data, error } = await supabase
        .from("dining_sessions")
        .update({ status: "closed", closed_at: now, updated_at: now })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) return updated;
      return mapDiningSessionFromDb(data);
    } catch {
      return updated;
    }
  }

  async getRunningBill(sessionId: string): Promise<RunningBill | null> {
    const session = await this.getDiningSessionById(sessionId);
    if (!session) return null;

    const allOrders = await this.getRestaurantOrders();
    const sessionOrders = allOrders
      .filter((o) => o.sessionId === session.id || (session.orderIds && session.orderIds.includes(o.id)))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const itemsMap = new Map<string, RunningBillItem>();

    for (const ord of sessionOrders) {
      for (const it of ord.items) {
        const key = `${it.menuItemId}-${it.name}-${it.price}`;
        const existing = itemsMap.get(key);
        const lineTotal = it.price * it.quantity;

        if (existing) {
          existing.quantity += it.quantity;
          existing.lineTotal += lineTotal;
          existing.orders.push({
            orderNumber: ord.orderNumber,
            quantity: it.quantity,
            time: ord.createdAt,
            round: ord.orderRound,
          });
        } else {
          itemsMap.set(key, {
            id: it.id,
            menuItemId: it.menuItemId,
            name: it.name,
            category: it.category,
            unitPrice: it.price,
            quantity: it.quantity,
            lineTotal,
            orders: [
              {
                orderNumber: ord.orderNumber,
                quantity: it.quantity,
                time: ord.createdAt,
                round: ord.orderRound,
              },
            ],
          });
        }
      }
    }

    const items = Array.from(itemsMap.values());
    const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const totalAmount = subtotal + tax;
    const billNumber =
      session.billNumber ||
      `AMB-BILL-${session.sessionNumber ? session.sessionNumber.replace(/\D/g, "") : session.id.slice(-4)}`;
    const billDate = session.closedAt || session.updatedAt || session.createdAt;

    return {
      session,
      orders: sessionOrders,
      items,
      subtotal,
      tax,
      totalAmount,
      billNumber,
      billDate,
    };
  }

  subscribeToDiningSessions(
    callback: (session: DiningSession, eventType: "INSERT" | "UPDATE") => void
  ): () => void {
    const channelId = `dining-sessions-live-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase.channel(channelId);

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dining_sessions" },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const mapped = mapDiningSessionFromDb(payload.new);
            callback(mapped, payload.eventType as any);
          }
        }
      )
      .subscribe();

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("hotel_ambrosia_sessions");
      bc.onmessage = (event) => {
        if (event.data?.type === "SYNC_SESSIONS" && Array.isArray(event.data.sessions)) {
          const sessions: DiningSession[] = event.data.sessions;
          if (sessions.length > 0) {
            callback(sessions[0], "UPDATE");
          }
        }
      };
    }

    return () => {
      supabase.removeChannel(channel);
      if (bc) bc.close();
    };
  }

  // ═══════════════════════════════════════════
  // 10. DASHBOARD STATS (Aggregated from Supabase)
  // ═══════════════════════════════════════════

  async getDashboardStats(): Promise<DashboardStats> {
    const [bookings, enquiries, rooms, menuItems, gallery, orders] = await Promise.all([
      this.getBookings(),
      this.getEnquiries(),
      this.getRooms(),
      this.getMenuItems(),
      this.getGalleryItems(),
      this.getRestaurantOrders(),
    ]);

    const todayStr = new Date().toISOString().split("T")[0];
    const todayBookings = bookings.filter((b) => b.checkIn === todayStr).length;
    const activeOrders = orders.filter(
      (o) => o.status === "new" || o.status === "accepted" || o.status === "preparing" || o.status === "ready"
    ).length;

    return {
      totalBookings: bookings.length,
      todayBookings,
      pendingBookings: bookings.filter((b) => b.status === "pending").length,
      confirmedBookings: bookings.filter((b) => b.status === "confirmed").length,
      cancelledBookings: bookings.filter((b) => b.status === "cancelled").length,
      checkedInBookings: bookings.filter((b) => b.status === "checked-in").length,
      totalEnquiries: enquiries.length,
      unreadEnquiries: enquiries.filter((e) => !e.read).length,
      totalRooms: rooms.length,
      totalMenuItems: menuItems.length,
      totalGalleryItems: gallery.length,
      totalOrders: orders.length,
      activeOrders,
      recentBookings: [...bookings]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
      recentEnquiries: [...enquiries]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    };
  }
}

export const adminStore = new AdminStore();
