-- ============================================
-- Migration v2: Add logo and custom title support
-- Run in Supabase SQL Editor
-- ============================================

-- Add logo_data column (stores base64-encoded image)
ALTER TABLE tests ADD COLUMN IF NOT EXISTS logo_data TEXT;

-- Add public_access column (allows anonymous test taking)
ALTER TABLE tests ADD COLUMN IF NOT EXISTS allow_anonymous BOOLEAN DEFAULT TRUE;

-- Allow public read access via share_code for anonymous users
DROP POLICY IF EXISTS "Anonymous can view tests via share code" ON tests;
CREATE POLICY "Anonymous can view tests via share code" ON tests
  FOR SELECT
  USING (allow_anonymous = TRUE);

DROP POLICY IF EXISTS "Anonymous can view questions of shareable tests" ON questions;
CREATE POLICY "Anonymous can view questions of shareable tests" ON questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = questions.test_id
      AND tests.allow_anonymous = TRUE
    )
  );
