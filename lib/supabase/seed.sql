-- Seed script for Natalia Katowicz Site Principal
-- Created to set initial admin access and storage structure

-- Insert admin user
INSERT INTO public.approved_users (email, password)
VALUES ('nataliakatowicz@gmail.com', '$2b$10$4fUYxWMeL//K.4omGSs4G.CLWCbVJIoxGUPio2lzHzJ6QkmwzqtWy')
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

-- Create storage bucket for approved_users
INSERT INTO storage.buckets (id, name, public)
VALUES ('approved_users', 'approved_users', false)
ON CONFLICT (id) DO NOTHING;
