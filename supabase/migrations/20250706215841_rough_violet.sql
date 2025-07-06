/*
  # Add admin fields to applications table

  1. New Columns
    - `status` (text, default 'pending') - Application status for admin workflow
    - `score` (integer) - AI-generated candidate score

  2. Indexes
    - Add index on status for efficient filtering
    - Add index on score for sorting

  3. Constraints
    - Add check constraint for valid status values
*/

-- Add status column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'status'
  ) THEN
    ALTER TABLE applications ADD COLUMN status text DEFAULT 'pending';
  END IF;
END $$;

-- Add score column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'score'
  ) THEN
    ALTER TABLE applications ADD COLUMN score integer;
  END IF;
END $$;

-- Add check constraint for status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'applications' AND constraint_name = 'applications_status_check'
  ) THEN
    ALTER TABLE applications ADD CONSTRAINT applications_status_check 
    CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected'));
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS applications_status_idx ON applications(status);
CREATE INDEX IF NOT EXISTS applications_score_idx ON applications(score DESC);