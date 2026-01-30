-- Insert default guest user if not exists
INSERT INTO users (id, email, subscription_tier)
VALUES ('00000000-0000-0000-0000-000000000000', 'guest@kalakthul.local', 'free')
ON CONFLICT (id) DO NOTHING;
