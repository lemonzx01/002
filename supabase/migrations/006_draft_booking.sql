-- ============================================================
-- Draft Bookings - บันทึกจองไว้ก่อน
-- ============================================================

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS draft_token VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for draft lookup
CREATE INDEX IF NOT EXISTS idx_bookings_draft_token ON bookings(draft_token) WHERE is_draft = true;
