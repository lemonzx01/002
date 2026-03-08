-- ============================================================
-- Table: coupons - ระบบส่วนลด/โปรโมชัน
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    description_th TEXT,
    description_en TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    min_booking_value DECIMAL(10, 2) DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    applicable_to VARCHAR(50) DEFAULT 'all' CHECK (applicable_to IN ('all', 'hotel', 'car')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_valid ON coupons(valid_from, valid_until);

-- Insert sample coupons
INSERT INTO coupons (code, description_th, description_en, discount_type, discount_value, min_booking_value, valid_from, valid_until, is_active) VALUES
('WELCOME10', 'ส่วนลด 10% สำหรับการจองครั้งแรก', '10% off for first booking', 'percentage', 10, 0, '2026-01-01', '2026-12-31', true),
('SUMMER50', 'ส่วนลด 50 บาท', '50 THB off', 'fixed', 50, 500, '2026-03-01', '2026-04-30', true),
('HOTEL25', 'ส่วนลด 25% โรงแรม', '25% off hotels', 'percentage', 25, 1000, '2026-01-01', '2026-06-30', true);

-- ============================================================
-- Table: used_coupons - บันทึกการใช้coupon
-- ============================================================
CREATE TABLE IF NOT EXISTS used_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    user_id UUID REFERENCES users(id),
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(coupon_id, booking_id)
);

CREATE INDEX idx_used_coupons_coupon_id ON used_coupons(coupon_id);
CREATE INDEX idx_used_coupons_booking_id ON used_coupons(booking_id);
