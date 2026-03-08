-- ============================================================
-- Table: car_options - ตัวเลือกเพิ่มเติมสำหรับรถเช่า
-- ============================================================
CREATE TABLE IF NOT EXISTS car_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    name_th VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_th TEXT,
    description_en TEXT,
    price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('per_day', 'per_booking', 'per_person')),
    price DECIMAL(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample car options
INSERT INTO car_options (car_id, name_th, name_en, description_th, description_en, price_type, price) VALUES
-- For car-001 (Toyota Camry Taxi)
('car-001', 'รวมค่าคนขับ', 'Including driver', 'รวมค่าคนขับแล้ว', 'Driver fee included', 'per_booking', 0),
('car-001', 'เพิ่มคนขับ', 'Add driver', 'เพิ่มบริการคนขับ', 'Add professional driver', 'per_day', 500),

-- For car-002 (Mitsubishi Pajero)
('car-002', 'รวมค่าคนขับ', 'Including driver', 'รวมค่าคนขับแล้ว', 'Driver fee included', 'per_booking', 0),
('car-002', 'ขับเอง', 'Self-drive', 'รับรถไปขับเอง', 'Pick up and drive yourself', 'per_booking', -500),
('car-002', 'เพิ่มเบาะเด็ก', 'Add child seat', 'เบาะนั่งสำหรับเด็ก', 'Child safety seat', 'per_booking', 200),
('car-002', 'เพิ่ม GPS', 'Add GPS', 'ระบบนำทาง GPS', 'GPS navigation system', 'per_day', 100),

-- For car-003 (Mercedes-Benz C-Class)
('car-003', 'รวมค่าคนขับ', 'Including driver', 'รวมค่าคนขับแล้ว', 'Driver fee included', 'per_booking', 0),
('car-003', 'รับจากสนามบิน', 'Airport pickup', 'รับจากสนามบินฟรี', 'Free airport pickup', 'per_booking', 0),
('car-003', 'ทัวร์ต่างจังหวัด', 'Outstation tour', 'ทัวร์ต่างจังหวัด', 'Outstation tour package', 'per_booking', 2000);

-- ============================================================
-- Table: booking_car_options - ตัวเลือกที่เลือกในการจอง
-- ============================================================
CREATE TABLE IF NOT EXISTS booking_car_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES car_options(id),
    quantity INTEGER DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
