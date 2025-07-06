/*
  # Update applications table to support more job roles

  1. Changes
    - Update role constraint to include new job roles
    - Add index for better performance with more roles

  2. New Roles Added
    - Backend Engineer
    - Full Stack Engineer  
    - Data Scientist
    - DevOps Engineer
    - Product Manager
    - UI/UX Designer
    - Mobile Developer
    - QA Engineer
*/

-- Drop the existing constraint
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_role_check;

-- Add new constraint with expanded roles
ALTER TABLE applications ADD CONSTRAINT applications_role_check 
CHECK (role = ANY (ARRAY[
  'frontend-engineer'::text,
  'product-designer'::text,
  'backend-engineer'::text,
  'fullstack-engineer'::text,
  'data-scientist'::text,
  'devops-engineer'::text,
  'product-manager'::text,
  'ui-ux-designer'::text,
  'mobile-developer'::text,
  'qa-engineer'::text
]));

-- Update the role index to be more efficient
DROP INDEX IF EXISTS applications_role_idx;
CREATE INDEX applications_role_idx ON applications USING btree (role);

-- Add a composite index for role and status for better admin queries
CREATE INDEX IF NOT EXISTS applications_role_status_idx ON applications USING btree (role, status);