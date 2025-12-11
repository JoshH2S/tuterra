-- ============================================================================
-- FIRST30 Promotional Campaign Schema
-- ============================================================================
-- Adds support for promo codes, promotional internships, and feedback consent
-- Campaign: First 30 users get 1 free virtual internship with FIRST30 code
-- Start Date: December 10, 2025
-- ============================================================================

-- Add promotional fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS promotional_internships_remaining INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS promo_code_used TEXT,
ADD COLUMN IF NOT EXISTS feedback_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS feedback_consent_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS feedback_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS feedback_email_sent_at TIMESTAMPTZ;

-- Create index for querying promotional users
CREATE INDEX IF NOT EXISTS idx_profiles_promo_code 
  ON profiles(promo_code_used) 
  WHERE promo_code_used IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_promo_internships 
  ON profiles(promotional_internships_remaining) 
  WHERE promotional_internships_remaining > 0;

-- Add promotional tracking to internship_sessions
ALTER TABLE internship_sessions
ADD COLUMN IF NOT EXISTS is_promotional BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS promo_code TEXT;

CREATE INDEX IF NOT EXISTS idx_internship_sessions_promotional 
  ON internship_sessions(is_promotional, user_id) 
  WHERE is_promotional = TRUE;

-- ============================================================================
-- Promo Codes Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS promotional_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('free_internship', 'discount', 'trial')),
  max_uses INTEGER NOT NULL,
  current_uses INTEGER DEFAULT 0,
  internships_granted INTEGER DEFAULT 1,
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for active promo codes
CREATE INDEX IF NOT EXISTS idx_promo_codes_active 
  ON promotional_codes(code, starts_at, expires_at) 
  WHERE current_uses < max_uses;

-- ============================================================================
-- Promo Code Redemptions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS promotional_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES promotional_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  UNIQUE(code_id, user_id)
);

-- Create indexes for redemption tracking
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_user 
  ON promotional_code_redemptions(user_id, redeemed_at);

CREATE INDEX IF NOT EXISTS idx_promo_redemptions_code 
  ON promotional_code_redemptions(code_id, redeemed_at);

-- ============================================================================
-- Feedback Reminders Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS promotional_feedback_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  internship_session_id UUID NOT NULL REFERENCES internship_sessions(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  feedback_submitted BOOLEAN DEFAULT FALSE,
  feedback_submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, internship_session_id)
);

CREATE INDEX IF NOT EXISTS idx_feedback_reminders_scheduled 
  ON promotional_feedback_reminders(scheduled_for, sent_at) 
  WHERE sent_at IS NULL;

-- ============================================================================
-- Insert FIRST30 Promo Code
-- ============================================================================
INSERT INTO promotional_codes (
  code, 
  type, 
  max_uses, 
  internships_granted,
  starts_at,
  expires_at,
  metadata
) VALUES (
  'FIRST30',
  'free_internship',
  30,
  1,
  '2025-12-10 00:00:00+00',  -- Start date
  NULL,                       -- No expiration
  '{
    "campaign": "first_30_users",
    "requires_feedback_consent": true,
    "feedback_delay_days": 30,
    "description": "First 30 users get 1 free virtual internship"
  }'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  max_uses = EXCLUDED.max_uses,
  starts_at = EXCLUDED.starts_at,
  expires_at = EXCLUDED.expires_at,
  metadata = EXCLUDED.metadata;

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to validate promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  OUT is_valid BOOLEAN,
  OUT error_message TEXT,
  OUT code_id UUID,
  OUT internships_to_grant INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_promo promotional_codes%ROWTYPE;
BEGIN
  -- Default values
  is_valid := FALSE;
  error_message := NULL;
  code_id := NULL;
  internships_to_grant := 0;
  
  -- Look up promo code
  SELECT * INTO v_promo
  FROM promotional_codes
  WHERE code = UPPER(p_code);
  
  IF NOT FOUND THEN
    error_message := 'Invalid promo code';
    RETURN;
  END IF;
  
  -- Check if code has started
  IF v_promo.starts_at > NOW() THEN
    error_message := 'This promo code is not yet active';
    RETURN;
  END IF;
  
  -- Check if code has expired
  IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < NOW() THEN
    error_message := 'This promo code has expired';
    RETURN;
  END IF;
  
  -- Check if code has reached max uses
  IF v_promo.current_uses >= v_promo.max_uses THEN
    error_message := 'This promo code has reached its usage limit';
    RETURN;
  END IF;
  
  -- Code is valid
  is_valid := TRUE;
  code_id := v_promo.id;
  internships_to_grant := v_promo.internships_granted;
END;
$$;

-- Function to redeem promo code
CREATE OR REPLACE FUNCTION redeem_promo_code(
  p_user_id UUID,
  p_code TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  OUT success BOOLEAN,
  OUT error_message TEXT,
  OUT internships_granted INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_validation RECORD;
  v_existing_redemption RECORD;
BEGIN
  -- Default values
  success := FALSE;
  error_message := NULL;
  internships_granted := 0;
  
  -- Validate the promo code
  SELECT * INTO v_validation
  FROM validate_promo_code(p_code);
  
  IF NOT v_validation.is_valid THEN
    error_message := v_validation.error_message;
    RETURN;
  END IF;
  
  -- Check if user has already redeemed this code
  SELECT * INTO v_existing_redemption
  FROM promotional_code_redemptions
  WHERE code_id = v_validation.code_id
    AND user_id = p_user_id;
  
  IF FOUND THEN
    error_message := 'You have already redeemed this promo code';
    RETURN;
  END IF;
  
  -- Create redemption record
  INSERT INTO promotional_code_redemptions (
    code_id,
    user_id,
    ip_address,
    user_agent
  ) VALUES (
    v_validation.code_id,
    p_user_id,
    p_ip_address,
    p_user_agent
  );
  
  -- Update promo code usage count
  UPDATE promotional_codes
  SET 
    current_uses = current_uses + 1,
    updated_at = NOW()
  WHERE id = v_validation.code_id;
  
  -- Grant promotional internships to user
  UPDATE profiles
  SET 
    promotional_internships_remaining = promotional_internships_remaining + v_validation.internships_to_grant,
    promo_code_used = p_code
  WHERE id = p_user_id;
  
  -- Success
  success := TRUE;
  internships_granted := v_validation.internships_to_grant;
END;
$$;

-- Function to schedule feedback reminder
CREATE OR REPLACE FUNCTION schedule_feedback_reminder(
  p_user_id UUID,
  p_session_id UUID,
  p_days_delay INTEGER DEFAULT 30
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO promotional_feedback_reminders (
    user_id,
    internship_session_id,
    scheduled_for
  ) VALUES (
    p_user_id,
    p_session_id,
    NOW() + (p_days_delay || ' days')::INTERVAL
  )
  ON CONFLICT (user_id, internship_session_id) 
  DO UPDATE SET scheduled_for = EXCLUDED.scheduled_for;
END;
$$;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE promotional_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotional_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotional_feedback_reminders ENABLE ROW LEVEL SECURITY;

-- Promo codes: Anyone can read active codes (for validation)
CREATE POLICY "Anyone can view active promo codes"
  ON promotional_codes
  FOR SELECT
  USING (
    current_uses < max_uses 
    AND starts_at <= NOW() 
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Redemptions: Users can view their own redemptions
CREATE POLICY "Users can view own redemptions"
  ON promotional_code_redemptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Feedback reminders: Users can view their own reminders
CREATE POLICY "Users can view own feedback reminders"
  ON promotional_feedback_reminders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Feedback reminders: Users can update their own reminders
CREATE POLICY "Users can update own feedback reminders"
  ON promotional_feedback_reminders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update timestamp on promo code changes
CREATE OR REPLACE FUNCTION update_promotional_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_promotional_codes_timestamp
  BEFORE UPDATE ON promotional_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_promotional_codes_updated_at();

-- ============================================================================
-- Grant Permissions
-- ============================================================================

-- Note: Supabase uses RLS policies for access control rather than direct grants
-- The following grants are commented out as RLS policies handle permissions
-- SECURITY DEFINER functions will run with elevated privileges

-- Grant service role full access for edge functions (commented - not needed with RLS)
-- GRANT ALL ON promotional_codes TO service_role;
-- GRANT ALL ON promotional_code_redemptions TO service_role;
-- GRANT ALL ON promotional_feedback_reminders TO service_role;

-- Grant authenticated users access (commented - RLS policies handle this)
-- GRANT SELECT ON promotional_codes TO authenticated;
-- GRANT SELECT, INSERT ON promotional_code_redemptions TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON promotional_feedback_reminders TO authenticated;
