-- ═══════════════════════════════════════════
-- Hotel Ambrosia - Supabase Database Setup
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════

-- 1. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Silver', 'Gold')),
  price JSONB NOT NULL DEFAULT '{"single": 0, "double": 0}',
  description TEXT,
  facilities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  guest_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  room_type TEXT NOT NULL CHECK (room_type IN ('Silver', 'Gold')),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Starters', 'Main Course', 'Chinese', 'South Indian', 'Desserts', 'Beverages')),
  price INTEGER NOT NULL,
  description TEXT,
  image TEXT,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Banquet Halls Table
CREATE TABLE IF NOT EXISTS banquet_halls (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Banquet Enquiries Table
CREATE TABLE IF NOT EXISTS banquet_enquiries (
  id TEXT PRIMARY KEY,
  hall_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  guests INTEGER NOT NULL,
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Gallery Items Table
CREATE TABLE IF NOT EXISTS gallery_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Virtual Tours Table
CREATE TABLE IF NOT EXISTS virtual_tours (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Enquiries Table
CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT DEFAULT '',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Website Content Table
CREATE TABLE IF NOT EXISTS website_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  content JSONB NOT NULL DEFAULT '{"homepage":{"title":"","subtitle":"","description":""},"about":{"title":"","description":""},"contact":{"phone":"","email":"","address":"","whatsapp":""},"socialLinks":{"facebook":"","twitter":"","instagram":"","pinterest":""}}'
);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE banquet_halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE banquet_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;

-- Public read access (for the hotel website)
CREATE POLICY "Public can read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Public can read bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Public can read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public can read banquet_halls" ON banquet_halls FOR SELECT USING (true);
CREATE POLICY "Public can read banquet_enquiries" ON banquet_enquiries FOR SELECT USING (true);
CREATE POLICY "Public can read gallery_items" ON gallery_items FOR SELECT USING (true);
CREATE POLICY "Public can read virtual_tours" ON virtual_tours FOR SELECT USING (true);
CREATE POLICY "Public can read enquiries" ON enquiries FOR SELECT USING (true);
CREATE POLICY "Public can read website_content" ON website_content FOR SELECT USING (true);

-- Allow service role to do everything (bypasses RLS)
-- This is used by the admin dashboard

-- Insert seed data
INSERT INTO rooms (id, name, type, price, description, facilities, images, status, created_at) VALUES
('room-1', 'Silver Room', 'Silver', '{"single": 1800, "double": 2300}', 'Elegant, shimmering silver accents with comfortable and modern furnishings. A perfect blend of style and comfort for the discerning traveler.', '["High-Speed Wi-Fi", "Flat-Screen TV", "Air Conditioning", "24/7 Power Backup", "Room Service", "Modern Bathroom"]', '["/images/rooms/ROOM-18.jpg", "/images/rooms/ROOM-11.jpg", "/images/rooms/ROOM-101.jpg"]', 'available', NOW() - INTERVAL '30 days'),
('room-2', 'Gold Room', 'Gold', '{"single": 2005, "double": 2520}', 'A fairytale feel with gold-accented walls, lavish furniture, and cozy luxury. The perfect retreat for guests seeking an unforgettable experience.', '["High-Speed Wi-Fi", "Flat-Screen TV", "In-Room Coffee Maker", "Air Conditioning", "24/7 Power Backup", "Premium Toiletries", "Mini Fridge"]', '["/images/rooms/ROOM-161.jpg", "/images/rooms/ROOM-101.jpg", "/images/rooms/ROOM-18.jpg"]', 'available', NOW() - INTERVAL '30 days');

INSERT INTO bookings (id, guest_name, phone, email, room_type, check_in, check_out, guests, status, notes, created_at) VALUES
('bk-1', 'Rahul Shahi', '+91 98765 43210', 'rahul.shahi@example.com', 'Gold', CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '4 days', 2, 'confirmed', 'Late check-in requested (around 8 PM)', NOW() - INTERVAL '2 days'),
('bk-2', 'Smit Patel', '+91 98251 23456', 'smit.patel@example.com', 'Silver', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days', 1, 'checked-in', 'Single occupancy, ground floor preferred', NOW() - INTERVAL '1 day'),
('bk-3', 'Priya Sharma', '+91 94280 98765', 'priya.sharma@example.com', 'Gold', CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '6 days', 2, 'pending', 'Anniversary celebration stay', NOW() - INTERVAL '5 hours'),
('bk-4', 'Amitabh Verma', '+91 98980 11223', 'amitabh.v@example.com', 'Silver', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '1 day', 2, 'checked-out', '', NOW() - INTERVAL '5 days'),
('bk-5', 'Vikram Mehta', '+91 97123 45678', 'vikram.mehta@example.com', 'Gold', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '7 days', 3, 'confirmed', 'Extra mattress needed', NOW() - INTERVAL '3 days'),
('bk-6', 'Neha Joshi', '+91 99090 33445', 'neha.j@example.com', 'Silver', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '3 days', 1, 'cancelled', 'Cancelled due to travel rescheduling', NOW() - INTERVAL '4 days'),
('bk-7', 'Anand Desai', '+91 98240 55667', 'anand.desai@example.com', 'Gold', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 2, 'confirmed', 'Corporate client', NOW() - INTERVAL '12 hours'),
('bk-8', 'Deepak Trivedi', '+91 98795 66778', 'deepak.t@example.com', 'Silver', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '10 days', 2, 'pending', '', NOW() - INTERVAL '2 hours');

INSERT INTO menu_items (id, name, category, price, description, image, available, created_at) VALUES
('m-1', 'Paneer Tikka Angara', 'Starters', 280, 'Cottage cheese marinated in fiery spices and grilled in tandoor', '/images/restaurant/REASTURANT-201.jpg', true, NOW()),
('m-2', 'Hara Bhara Kebab', 'Starters', 240, 'Crispy spinach and green pea patties served with mint chutney', '/images/restaurant/REASTURANT-191-1-1024x670.jpg', true, NOW()),
('m-3', 'Ambrosia Special Paneer', 'Main Course', 340, 'Chef''s signature cottage cheese gravy infused with rich cashew & aromatic herbs', '/images/restaurant/REASTURANT-201.jpg', true, NOW()),
('m-4', 'Dal Makhani', 'Main Course', 260, 'Slow-cooked black lentils simmered overnight with butter and cream', '/images/restaurant/REASTURANT-191-1-1024x670.jpg', true, NOW()),
('m-5', 'Veg Manchurian Dry', 'Chinese', 230, 'Vegetable balls tossed in garlic, ginger, and spicy soya sauce', '/images/restaurant/REASTURANT-201.jpg', true, NOW()),
('m-6', 'Hakka Noodles', 'Chinese', 210, 'Wok-tossed noodles with shredded vegetables and oriental seasonings', '/images/restaurant/REASTURANT-191-1-1024x670.jpg', true, NOW()),
('m-7', 'Mysore Masala Dosa', 'South Indian', 180, 'Crispy rice crepe smeared with red chili chutney and potato filling', '/images/restaurant/REASTURANT-201.jpg', true, NOW()),
('m-8', 'Sambar Vada (2 pcs)', 'South Indian', 140, 'Golden fried lentil donuts soaked in steaming aromatic sambar', '/images/restaurant/REASTURANT-191-1-1024x670.jpg', true, NOW()),
('m-9', 'Gulab Jamun with Ice Cream', 'Desserts', 160, 'Warm sweet dumplings paired with rich vanilla ice cream', '/images/restaurant/REASTURANT-201.jpg', true, NOW()),
('m-10', 'Sizzling Brownie', 'Desserts', 220, 'Chocolate brownie on hot sizzler plate with chocolate syrup', '/images/restaurant/REASTURANT-191-1-1024x670.jpg', true, NOW()),
('m-11', 'Fresh Lime Soda', 'Beverages', 90, 'Choice of sweet, salted, or mixed refreshment', '/images/restaurant/REASTURANT-201.jpg', true, NOW()),
('m-12', 'Cold Coffee with Ice Cream', 'Beverages', 150, 'Thick, creamy brewed coffee blended with vanilla scoop', '/images/restaurant/REASTURANT-201.jpg', true, NOW());

INSERT INTO banquet_halls (id, name, capacity, price, description, images, created_at) VALUES
('hall-1', 'Grand Ballroom & Banquet', 350, 25000, 'An opulent venue equipped with crystal chandeliers, customizable stage lighting, and full acoustic sound systems. Perfect for weddings, receptions, and corporate conferences.', '["/images/banquet/BANQUTE-191-1024x671.jpg", "/images/banquet/BANQUTE-81-1024x671.jpg", "/images/banquet/reception-1.jpg"]', NOW());

INSERT INTO banquet_enquiries (id, hall_id, name, phone, email, event_type, event_date, guests, message, status, created_at) VALUES
('be-1', 'hall-1', 'Rajeshwar Rao', '+91 98250 11223', 'rajeshwar.rao@example.com', 'Wedding', '2026-11-20', 300, 'Looking for full catering package + decor for daughter''s wedding.', 'confirmed', NOW() - INTERVAL '3 days'),
('be-2', 'hall-1', 'Aakash Technosoft', '+91 97140 22334', 'hr@aakashtechno.com', 'Corporate Conference', '2026-10-15', 150, 'Annual awards ceremony. Need projector, stage, and buffet dinner.', 'pending', NOW() - INTERVAL '1 day');

INSERT INTO gallery_items (id, type, url, title, category, visible, created_at) VALUES
('g-1', 'image', '/images/home/Hotel-Ambrosia-Outside-3.jpg', 'Hotel Exterior Night View', 'Hotel', true, NOW()),
('g-2', 'image', '/images/rooms/ROOM-101.jpg', 'Luxury Suite Bedroom', 'Rooms', true, NOW()),
('g-3', 'image', '/images/restaurant/REASTURANT-191-1-1024x670.jpg', 'Fine Dining Restaurant Area', 'Restaurant', true, NOW()),
('g-4', 'image', '/images/banquet/BANQUTE-191-1024x671.jpg', 'Grand Banquet Stage', 'Banquet', true, NOW()),
('g-5', 'image', '/images/banquet/reception-1.jpg', 'Reception Banquet Setup', 'Banquet', true, NOW()),
('g-6', 'image', '/images/rooms/ROOM-161.jpg', 'Gold Room Interiors', 'Rooms', true, NOW());

INSERT INTO virtual_tours (id, title, description, location, url, type, visible, created_at) VALUES
('vt-1', 'Main Lobby & Reception', 'Experience the warm welcome of Hotel Ambrosia.', 'Ground Floor', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.5!2d72.9529!3d22.5434!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDMyJzM2LjIiTiA3MsKwNTcnMTAuNCJF!5e0!3m2!1sen!2sin!4v1', 'image', true, NOW()),
('vt-2', 'Gold Room Suite', '360-degree tour of our Gold Room.', '2nd Floor', '/images/rooms/ROOM-161.jpg', 'image', true, NOW()),
('vt-3', 'Grand Banquet Hall', 'Tour of the 350-capacity event hall.', '1st Floor', '/images/banquet/BANQUTE-191-1024x671.jpg', 'image', true, NOW());

INSERT INTO enquiries (id, name, phone, email, message, read, created_at) VALUES
('enq-1', 'Dr. Krunal Patel', '+91 98254 99887', 'krunal.patel@example.com', 'Do you offer group discounts for medical conference delegates (approx 20 rooms)?', false, NOW() - INTERVAL '1 hour'),
('enq-2', 'Shweta Merchant', '+91 99786 55443', 'shweta.m@example.com', 'Inquiry regarding candlelight dinner setup for anniversary at your restaurant.', false, NOW() - INTERVAL '8 hours'),
('enq-3', 'Bhavin Shah', '+91 98981 22334', 'bhavin.shah@example.com', 'Want to book the banquet hall for a birthday party on Sunday next week with 60 guests.', true, NOW() - INTERVAL '1 day'),
('enq-4', 'Meera Trivedi', '+91 94265 11229', 'meera.t@example.com', 'Can we have an early check-in at 8 AM for Silver room? Please confirm charges.', true, NOW() - INTERVAL '2 days'),
('enq-5', 'Rameshwar Gidwani', '+91 97129 88776', 'rameshwar@example.com', 'Looking for pure vegetarian Jain food options for wedding event catering.', true, NOW() - INTERVAL '3 days');

INSERT INTO website_content (id, content) VALUES ('main', '{"homepage":{"title":"Welcome to\\nHotel Ambrosia","subtitle":"The Grand Hotel","description":"Your Premier Event Destination in Anand"},"about":{"title":"Experience Luxury & Warmth in Anand","description":"Nestled in the heart of Anand, Hotel Ambrosia — The Grand Hotel offers a perfect blend of comfort and elegance. Whether you''re seeking a luxurious stay, an exquisite dining experience, or the perfect venue for your celebration, we bring warmth and grandeur to every moment."},"contact":{"phone":"+91 26922 61215","email":"info@hotel-ambrosia.com","address":"Opp. Uma Bhavan, Nr. Municipal Water Tank, Anand Sojitra Road, Borsad Char Rasta, Anand – 388 001, Gujarat, India","whatsapp":"+91 97278 46100"},"socialLinks":{"facebook":"https://www.facebook.com/HotelAmbrosia15","twitter":"https://twitter.com/HotelAmbrosia5","instagram":"https://www.instagram.com/hotelambrosia_anand","pinterest":"https://www.pinterest.com/hotelambrosia5"}}');