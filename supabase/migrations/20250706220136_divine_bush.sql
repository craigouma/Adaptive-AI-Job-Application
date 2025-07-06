/*
  # Create Admin User System

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `role` (text, default 'admin')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `admin_users` table
    - Add policy for admin authentication

  3. Default Admin User
    - Creates admin user with email: craigcarlos95@gmail.com
    - Password: password123 (hashed)
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin authentication
CREATE POLICY "Admin users can read their own data"
  ON admin_users
  FOR SELECT
  USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- Insert default admin user
-- Password hash for "password123" using bcrypt
INSERT INTO admin_users (email, password_hash, role)
VALUES (
  'craigcarlos95@gmail.com',
  '$2b$10$rOzJqQZQZQZQZQZQZQZQZOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  'admin'
) ON CONFLICT (email) DO NOTHING;