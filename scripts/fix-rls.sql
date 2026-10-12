-- ═════════════════════════════════════════════════════════════════════
-- Hotel Ambrosia — RLS Policy Update for Supabase
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ═════════════════════════════════════════════════════════════════════

-- 1. BOOKINGS: allow public to create bookings, authenticated admins full access
DROP POLICY IF EXISTS "Public can read bookings" ON bookings;
DROP POLICY IF EXISTS "Public can insert bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can do everything on bookings" ON bookings;

CREATE POLICY "Public can read bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Public can insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything on bookings" ON bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. ENQUIRIES: allow public to submit, authenticated admins full access
DROP POLICY IF EXISTS "Public can read enquiries" ON enquiries;
DROP POLICY IF EXISTS "Public can insert enquiries" ON enquiries;
DROP POLICY IF EXISTS "Authenticated users can do everything on enquiries" ON enquiries;

CREATE POLICY "Public can read enquiries" ON enquiries FOR SELECT USING (true);
CREATE POLICY "Public can insert enquiries" ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything on enquiries" ON enquiries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. BANQUET ENQUIRIES: allow public to submit, authenticated admins full access
DROP POLICY IF EXISTS "Public can read banquet_enquiries" ON banquet_enquiries;
DROP POLICY IF EXISTS "Public can insert banquet_enquiries" ON banquet_enquiries;
DROP POLICY IF EXISTS "Authenticated users can do everything on banquet_enquiries" ON banquet_enquiries;

CREATE POLICY "Public can read banquet_enquiries" ON banquet_enquiries FOR SELECT USING (true);
CREATE POLICY "Public can insert banquet_enquiries" ON banquet_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything on banquet_enquiries" ON banquet_enquiries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. ROOMS: public read, authenticated admins full access
DROP POLICY IF EXISTS "Public can read rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated users can do everything on rooms" ON rooms;

CREATE POLICY "Public can read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can do everything on rooms" ON rooms FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. MENU ITEMS: public read, authenticated admins full access
DROP POLICY IF EXISTS "Public can read menu_items" ON menu_items;
DROP POLICY IF EXISTS "Authenticated users can do everything on menu_items" ON menu_items;

CREATE POLICY "Public can read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can do everything on menu_items" ON menu_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. BANQUET HALLS: public read, authenticated admins full access
DROP POLICY IF EXISTS "Public can read banquet_halls" ON banquet_halls;
DROP POLICY IF EXISTS "Authenticated users can do everything on banquet_halls" ON banquet_halls;

CREATE POLICY "Public can read banquet_halls" ON banquet_halls FOR SELECT USING (true);
CREATE POLICY "Authenticated users can do everything on banquet_halls" ON banquet_halls FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. GALLERY ITEMS: public read, authenticated admins full access
DROP POLICY IF EXISTS "Public can read gallery_items" ON gallery_items;
DROP POLICY IF EXISTS "Authenticated users can do everything on gallery_items" ON gallery_items;

CREATE POLICY "Public can read gallery_items" ON gallery_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can do everything on gallery_items" ON gallery_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. VIRTUAL TOURS: public read, authenticated admins full access
DROP POLICY IF EXISTS "Public can read virtual_tours" ON virtual_tours;
DROP POLICY IF EXISTS "Authenticated users can do everything on virtual_tours" ON virtual_tours;

CREATE POLICY "Public can read virtual_tours" ON virtual_tours FOR SELECT USING (true);
CREATE POLICY "Authenticated users can do everything on virtual_tours" ON virtual_tours FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. WEBSITE CONTENT: public read, authenticated admins full access
DROP POLICY IF EXISTS "Public can read website_content" ON website_content;
DROP POLICY IF EXISTS "Authenticated users can do everything on website_content" ON website_content;

CREATE POLICY "Public can read website_content" ON website_content FOR SELECT USING (true);
CREATE POLICY "Authenticated users can do everything on website_content" ON website_content FOR ALL TO authenticated USING (true) WITH CHECK (true);
