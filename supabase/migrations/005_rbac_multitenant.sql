-- ============================================================
-- Multi-Tenant & Role-Based Access Control
-- Version: 5.0.0
-- ============================================================

-- ============================================================
-- 1. Add partner_id to hotels and cars
-- ============================================================
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS partner_id UUID;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS partner_id UUID;

-- Add foreign key
ALTER TABLE hotels ADD CONSTRAINT fk_hotels_partner 
    FOREIGN KEY (partner_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE cars ADD CONSTRAINT fk_cars_partner 
    FOREIGN KEY (partner_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================
-- 2. Add roles to users table
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' 
    CHECK (role IN ('user', 'partner_hotel', 'partner_driver', 'admin'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================================
-- 3. Create partners table (organizations)
-- ============================================================
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name_th VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    type VARCHAR(50) NOT NULL CHECK (type IN ('hotel', 'driver', 'both')),
    email VARCHAR(255),
    phone VARCHAR(50),
    line_id VARCHAR(100),
    address_th TEXT,
    address_en TEXT,
    tax_id VARCHAR(50),
    bank_account VARCHAR(100),
    bank_name VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_partners_user_id ON partners(user_id);
CREATE INDEX idx_partners_type ON partners(type);

-- ============================================================
-- 4. Create driver_profiles table
-- ============================================================
CREATE TABLE IF NOT EXISTS driver_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    line_id VARCHAR(100),
    license_number VARCHAR(100),
    license_expiry DATE,
    profile_image_url TEXT,
    bio_th TEXT,
    bio_en TEXT,
    is_available BOOLEAN DEFAULT true,
    rating DECIMAL(3,2) DEFAULT 5.00,
    total_trips INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_driver_profiles_partner_id ON driver_profiles(partner_id);
CREATE INDEX idx_driver_profiles_available ON driver_profiles(is_available);

-- ============================================================
-- 5. Create driver availability schedule
-- ============================================================
CREATE TABLE IF NOT EXISTS driver_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_driver_schedules_driver_date ON driver_schedules(driver_id, date);

-- ============================================================
-- 6. Update bookings with driver info
-- ============================================================
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES driver_profiles(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id);

-- ============================================================
-- 7. Create role_permissions table
-- ============================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    permission VARCHAR(20) NOT NULL CHECK (permission IN ('create', 'read', 'update', 'delete')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, resource, permission)
);

-- Insert default permissions
INSERT INTO role_permissions (role, resource, permission) VALUES
-- Admin
('admin', 'all', 'create'),
('admin', 'all', 'read'),
('admin', 'all', 'update'),
('admin', 'all', 'delete'),

-- Hotel Partner
('partner_hotel', 'hotels', 'create'),
('partner_hotel', 'hotels', 'read'),
('partner_hotel', 'hotels', 'update'),
('partner_hotel', 'hotels', 'delete'),
('partner_hotel', 'bookings', 'read'),

-- Driver Partner
('partner_driver', 'drivers', 'create'),
('partner_driver', 'drivers', 'read'),
('partner_driver', 'drivers', 'update'),
('partner_driver', 'bookings', 'read'),
('partner_driver', 'schedules', 'create'),
('partner_driver', 'schedules', 'read'),
('partner_driver', 'schedules', 'update'),

-- User
('user', 'bookings', 'create'),
('user', 'bookings', 'read'),
('user', 'reviews', 'create'),
('user', 'wishlists', 'create'),
('user', 'wishlists', 'read'),
('user', 'wishlists', 'delete');

-- ============================================================
-- 8. Update function for updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_profiles_updated_at BEFORE UPDATE ON driver_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 9. Enable RLS and add policies
-- ============================================================
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_schedules ENABLE ROW LEVEL SECURITY;

-- Partners policies
CREATE POLICY "Users can view own partners" ON partners
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own partners" ON partners
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Driver profiles policies
CREATE POLICY "Users can view drivers" ON driver_profiles
    FOR SELECT USING (true);

CREATE POLICY "Partners can manage own drivers" ON driver_profiles
    FOR ALL USING (
        partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
    );
