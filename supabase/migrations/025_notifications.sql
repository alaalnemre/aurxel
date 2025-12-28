-- Create notification type enum
CREATE TYPE notification_type AS ENUM (
    'order_status',
    'discount',
    'payout',
    'badge',
    'featured',
    'system'
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title_key TEXT NOT NULL,
    message_key TEXT NOT NULL,
    metadata JSONB NULL,
    dedupe_key TEXT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for performance and deduplication
CREATE INDEX notifications_profile_id_created_at_idx ON notifications(profile_id, created_at DESC);
CREATE INDEX notifications_profile_id_unread_idx ON notifications(profile_id, is_read, created_at DESC);
CREATE UNIQUE INDEX notifications_dedupe_key_idx ON notifications(dedupe_key) WHERE dedupe_key IS NOT NULL;
