-- ============================================================
-- Got Journey Thailand - Database Schema Migrations
-- Version: 2.0.0
-- Date: 2026-03-06
-- ============================================================

-- ============================================================
-- Table: reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('hotel', 'car')),
    item_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment_th TEXT,
    comment_en TEXT,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_item_type ON reviews(item_type);
CREATE INDEX idx_reviews_item_id ON reviews(item_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================================
-- Table: wishlists
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('hotel', 'car')),
    item_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_item ON wishlists(item_type, item_id);

-- ============================================================
-- Table: exchange_rates
-- ============================================================
CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(18, 8) NOT NULL,
    valid_from DATE NOT NULL,
    valid_until DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);
CREATE INDEX idx_exchange_rates_valid_from ON exchange_rates(valid_from);

-- Insert default exchange rates
INSERT INTO exchange_rates (from_currency, to_currency, rate, valid_from, is_active) VALUES
('THB', 'USD', 0.029, '2026-01-01', true),
('THB', 'EUR', 0.027, '2026-01-01', true),
('THB', 'JPY', 4.50, '2026-01-01', true),
('THB', 'CNY', 0.21, '2026-01-01', true),
('THB', 'GBP', 0.023, '2026-01-01', true),
('USD', 'THB', 34.50, '2026-01-01', true),
('EUR', 'THB', 37.00, '2026-01-01', true);

-- ============================================================
-- Table: admin_sessions (for JWT refresh)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_token_hash ON admin_sessions(token_hash);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- ============================================================
-- Table: user_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- ============================================================
-- Table: email_templates
-- ============================================================
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL UNIQUE,
    subject_th TEXT NOT NULL,
    subject_en TEXT NOT NULL,
    body_th TEXT NOT NULL,
    body_en TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default email templates
INSERT INTO email_templates (type, subject_th, subject_en, body_th, body_en) VALUES
('booking_confirmation', 'ยืนยันการจอง {booking_code}', 'Booking Confirmation {booking_code}', 
 '<h1>ยืนยันการจอง</h1><p>รหัส: {booking_code}</p>', 
 '<h1>Confirm Your Booking</h1><p>Code: {booking_code}</p>'),
('payment_success', 'ชำระเงินสำเร็จ', 'Payment Successful',
 '<h1>ชำระเงินสำเร็จ!</h1><p>รหัส: {booking_code}</p>',
 '<h1>Payment Successful!</h1><p>Code: {booking_code}</p>'),
('booking_cancelled', 'ยกเลิกการจอง', 'Booking Cancelled',
 '<h1>การจองถูกยกเลิก</h1><p>รหัส: {booking_code}</p>',
 '<h1>Booking Cancelled</h1><p>Code: {booking_code}</p>');

-- ============================================================
-- Table: notifications (for in-app notifications)
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title_th VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    message_th TEXT,
    message_en TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================
-- Table: api_logs (for debugging & analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS api_logs (
    id BIGSERIAL PRIMARY KEY,
    method VARCHAR(10) NOT NULL,
    path VARCHAR(500) NOT NULL,
    query_params JSONB,
    request_body JSONB,
    response_status INTEGER,
    response_time_ms INTEGER,
    user_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_logs_method_path ON api_logs(method, path);
CREATE INDEX idx_api_logs_response_status ON api_logs(response_status);
CREATE INDEX idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX idx_api_logs_created_at ON api_logs(created_at DESC);

-- ============================================================
-- Function: Update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlists_updated_at BEFORE UPDATE ON wishlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can insert their own reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wishlist policies
CREATE POLICY "Users can view own wishlists" ON wishlists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlists" ON wishlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlists" ON wishlists
    FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- Comments
-- ============================================================
COMMENT ON TABLE reviews IS 'Store reviews/ratings for hotels and cars';
COMMENT ON TABLE wishlists IS 'User wishlists for hotels and cars';
COMMENT ON TABLE exchange_rates IS 'Currency exchange rates';
COMMENT ON TABLE admin_sessions IS 'Admin login sessions';
COMMENT ON TABLE user_sessions IS 'User login sessions';
COMMENT ON TABLE email_templates IS 'Email templates for notifications';
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON TABLE api_logs IS 'API request logs for debugging and analytics';
