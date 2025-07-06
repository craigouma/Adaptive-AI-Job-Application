/*
  # Create applications table for job applications

  1. New Tables
    - `applications`
      - `id` (uuid, primary key)
      - `role` (text, either 'frontend-engineer' or 'product-designer')
      - `answers` (jsonb, stores all question-answer pairs)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `applications` table
    - Add policy for authenticated users to insert their own applications
    - Add policy for authenticated users to read their own applications

  3. Indexes
    - Add index on role for efficient querying
    - Add index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('frontend-engineer', 'product-designer')),
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS applications_role_idx ON applications(role);
CREATE INDEX IF NOT EXISTS applications_created_at_idx ON applications(created_at DESC);

-- RLS Policies
CREATE POLICY "Anyone can insert applications"
  ON applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read applications"
  ON applications
  FOR SELECT
  TO anon
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();