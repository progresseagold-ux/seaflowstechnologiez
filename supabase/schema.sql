-- ==========================================
-- SEAFLOWS TECHNOLOGIES - SUPABASE MASTER SCHEMA
-- ==========================================

-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE (Linked to Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'super_admin', 'operations_manager', 'inventory_manager', 'sales_manager', 'technician', 'customer_support', 'content_manager')),
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. PRODUCTS TABLE
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('solar-panel', 'inverter', 'battery', 'solar-accessory', 'cctv-camera', 'cctv-recorder', 'cctv-accessory')),
    price NUMERIC NOT NULL CHECK (price >= 0),
    specifications JSONB DEFAULT '{}'::jsonb,
    image TEXT,
    rating NUMERIC DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    description TEXT,
    brand TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. PRODUCT REVIEWS TABLE
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. BOOKINGS TABLE
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    service_type TEXT NOT NULL CHECK (service_type IN ('solar', 'cctv', 'maintenance', 'inspection', 'consultation')),
    date DATE NOT NULL,
    time TIME NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed')),
    assigned_technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 5. SOLAR QUOTES TABLE
CREATE TABLE public.solar_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_location TEXT NOT NULL,
    building_type TEXT NOT NULL,
    appliances TEXT NOT NULL,
    load_requirement NUMERIC NOT NULL,
    backup_time NUMERIC NOT NULL,
    system_size_kw NUMERIC NOT NULL,
    required_panels_count INTEGER NOT NULL,
    panel_watts_each INTEGER NOT NULL,
    battery_capacity_ah INTEGER NOT NULL,
    battery_type TEXT NOT NULL,
    inverter_power_kva NUMERIC NOT NULL,
    charge_controller_ah NUMERIC NOT NULL,
    estimated_cost_ngn NUMERIC NOT NULL,
    estimated_savings_ngn NUMERIC,
    payback_period_years NUMERIC,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on solar_quotes
ALTER TABLE public.solar_quotes ENABLE ROW LEVEL SECURITY;

-- 6. CCTV QUOTES TABLE
CREATE TABLE public.cctv_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_location TEXT NOT NULL,
    cameras_count INTEGER NOT NULL CHECK (cameras_count > 0),
    camera_type TEXT NOT NULL,
    building_type TEXT NOT NULL,
    is_outdoor BOOLEAN NOT NULL DEFAULT FALSE,
    storage_days INTEGER NOT NULL CHECK (storage_days > 0),
    recorder_channels INTEGER NOT NULL,
    hard_drive_size_tb NUMERIC NOT NULL,
    power_supply_amps NUMERIC NOT NULL,
    accessories_needed TEXT[] DEFAULT '{}',
    estimated_cost_ngn NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on cctv_quotes
ALTER TABLE public.cctv_quotes ENABLE ROW LEVEL SECURITY;

-- 7. INSTALLMENT REQUESTS TABLE
CREATE TABLE public.installment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_price NUMERIC NOT NULL,
    down_payment_ngn NUMERIC NOT NULL,
    period_months INTEGER NOT NULL CHECK (period_months > 0),
    monthly_payment_ngn NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on installment_requests
ALTER TABLE public.installment_requests ENABLE ROW LEVEL SECURITY;

-- 8. ORDERS TABLE
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_address TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    total_ngn NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dispatched', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 9. ORDER ITEMS TABLE
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 10. TESTIMONIALS TABLE
CREATE TABLE public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 11. BLOG POSTS TABLE
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    author TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 12. PORTFOLIO ITEMS TABLE (PROJECT GALLERY)
CREATE TABLE public.portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    stats JSONB DEFAULT '{}'::jsonb,
    image_before TEXT NOT NULL,
    image_after TEXT NOT NULL,
    client_review TEXT,
    client_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on portfolio_items
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- 13. SUPPORT TICKETS TABLE
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 14. SUPPORT TICKET RESPONSES
CREATE TABLE public.support_ticket_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'admin')),
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on support_ticket_responses
ALTER TABLE public.support_ticket_responses ENABLE ROW LEVEL SECURITY;

-- 15. AUDIT LOGS Table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 16. NOTIFICATIONS Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Helpers: Check if a user is an Admin role.
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('super_admin', 'operations_manager', 'inventory_manager', 'sales_manager', 'technician', 'customer_support', 'content_manager')
  );
END;
$$ LANGUAGE plpgsql;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by anyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Super Admins can manage all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Products Policies
CREATE POLICY "Products are viewable by anyone" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (public.is_admin(auth.uid()));

-- Reviews Policies
CREATE POLICY "Reviews are viewable by anyone" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update/delete their own reviews" ON public.reviews
    FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Bookings Policies
CREATE POLICY "Clients can view their own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = client_id OR public.is_admin(auth.uid()));

CREATE POLICY "Anyone can request a booking" ON public.bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update and manage bookings" ON public.bookings
    FOR ALL USING (public.is_admin(auth.uid()));

-- Solar Quotes Policies
CREATE POLICY "Clients can view their own solar quotes" ON public.solar_quotes
    FOR SELECT USING (auth.uid() = client_id OR public.is_admin(auth.uid()));

CREATE POLICY "Anyone can request a solar quote" ON public.solar_quotes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update and manage solar quotes" ON public.solar_quotes
    FOR ALL USING (public.is_admin(auth.uid()));

-- CCTV Quotes Policies
CREATE POLICY "Clients can view their own cctv quotes" ON public.cctv_quotes
    FOR SELECT USING (auth.uid() = client_id OR public.is_admin(auth.uid()));

CREATE POLICY "Anyone can request a cctv quote" ON public.cctv_quotes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update and manage cctv quotes" ON public.cctv_quotes
    FOR ALL USING (public.is_admin(auth.uid()));

-- Installment Requests Policies
CREATE POLICY "Clients can view their own installment requests" ON public.installment_requests
    FOR SELECT USING (auth.uid() = client_id OR public.is_admin(auth.uid()));

CREATE POLICY "Anyone can submit installment requests" ON public.installment_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage installment requests" ON public.installment_requests
    FOR ALL USING (public.is_admin(auth.uid()));

-- Orders & Order Items Policies
CREATE POLICY "Clients can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = client_id OR public.is_admin(auth.uid()));

CREATE POLICY "Anyone can place an order" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Clients can view their own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_items.order_id AND (client_id = auth.uid() OR public.is_admin(auth.uid()))
        )
    );

CREATE POLICY "Anyone can insert order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all order items" ON public.order_items
    FOR ALL USING (public.is_admin(auth.uid()));

-- Support Tickets Policies
CREATE POLICY "Clients can view/manage their own tickets" ON public.support_tickets
    FOR ALL USING (auth.uid() = client_id OR public.is_admin(auth.uid()));

CREATE POLICY "Anonymous or clients can open tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Clients / Admins can read ticket responses" ON public.support_ticket_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets
            WHERE id = support_ticket_responses.ticket_id AND (client_id = auth.uid() OR public.is_admin(auth.uid()))
        )
    );

CREATE POLICY "Clients / Admins can send responses" ON public.support_ticket_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.support_tickets
            WHERE id = support_ticket_responses.ticket_id AND (client_id = auth.uid() OR public.is_admin(auth.uid()))
        )
    );

-- Static Content Policies (Blog, Testimonials, Portfolio)
CREATE POLICY "Static content is viewable by anyone" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Static content is viewable by anyone" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Static content is viewable by anyone" ON public.portfolio_items FOR SELECT USING (true);

CREATE POLICY "Content managers/Admins can edit static content" ON public.testimonials FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Content managers/Admins can edit static content" ON public.blog_posts FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Content managers/Admins can edit static content" ON public.portfolio_items FOR ALL USING (public.is_admin(auth.uid()));

-- Notifications Policies
CREATE POLICY "Users can view and manage their own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Audit Logs Policies
CREATE POLICY "Only Super Admins can access audit logs" ON public.audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );


-- ==========================================
-- AUTHENTICATION DB SYNC TRIGGER (EXCEPTION-RESILIENT)
-- ==========================================

-- Clean up any obsolete trigger names on auth.users left over from older template states
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_signup ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_profile_of_new_user ON auth.users;

-- Automatically create a profile profile when a user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New Customer'),
      COALESCE(new.raw_user_meta_data->>'role', 'customer')
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role;
  EXCEPTION WHEN OTHERS THEN
    -- Capture and ignore errors inside the trigger so they never crash the main sign-up transaction
    NULL;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the clean link trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- INITIAL POPULAR PRODUCTS SEED (SAMPLE DATA)
-- ==========================================
INSERT INTO public.products (name, category, price, stock, brand, description, specifications) VALUES
('420W Mono Half-Cell Solar Panel', 'solar-panel', 145000, 35, 'Seaflows', 'High-efficiency monocrystalline solar panel tailored for premium residential and heavy industrial deployment in solar-rich regions.', '{"Power Output": "420W", "Efficiency": "21.3%", "Warranty": "25 Years", "Cell Type": "Monocrystalline"}'),
('5kVA 48V Premium Pure Sine Inverter', 'inverter', 650000, 15, 'Seaflows', 'Robust smart pure sine wave inverter featuring native hybrid battery controls, instant automatic switchover, and remote telemetry dashboard integration.', '{"Capacity": "5kVA / 5000W", "Battery DC Voltage": "48V", "Efficiency": "93%"}'),
('200Ah 12V High-Performance Gel Battery', 'battery', 250000, 48, 'Seaflows', 'Deep-cycle maintenance-free solar battery engineered with long life-cycle advanced gel composition for rugged, uninterrupted load backup.', '{"Capacity": "200Ah", "Voltage": "12V", "Chemistry": "Deep-Cycle Gel", "Service Life": "10+ Years"}'),
('4K IP Outdoor Bullet CCTV Smart Camera', 'cctv-camera', 85000, 100, 'Seaflows', 'Professional weather-proof 8MP outdoor IP camera with integrated optical zoom, high-intensity infrared night vision, and real-time motion alarms.', '{"Resolution": "4K Ultra-HD", "NEMA Rating": "IP67 Weatherproof", "Night Vision": "Up to 50m"}'),
('16-Channel 8MP H.265+ Smart NVR Recorder', 'cctv-recorder', 195000, 12, 'Seaflows', 'Premium network video recorder supporting ultra-efficient video compression, multi-channel synchronous remote playback, and advanced motion-trigger alerting.', '{"Channels": "16 Channels", "Max Resolution": "8MP (4K)", "Compression": "H.265+", "Storage SLA": "Up to 10TB"}');
