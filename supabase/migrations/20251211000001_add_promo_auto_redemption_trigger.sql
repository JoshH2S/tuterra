-- ============================================================================
-- Auto-Redeem Promo Code on Profile Creation
-- ============================================================================
-- This trigger automatically redeems promo codes stored in user_metadata
-- when a new user profile is created (after email verification)
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user_promo_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_promo_code TEXT;
  v_feedback_consent BOOLEAN;
  v_validation RECORD;
  v_existing_redemption RECORD;
BEGIN
  -- Get promo code and feedback consent from auth.users metadata
  SELECT 
    (raw_user_meta_data->>'promo_code'),
    (raw_user_meta_data->>'feedback_consent')::BOOLEAN
  INTO v_promo_code, v_feedback_consent
  FROM auth.users
  WHERE id = NEW.id;
  
  -- If no promo code found, nothing to do
  IF v_promo_code IS NULL OR v_promo_code = '' THEN
    RETURN NEW;
  END IF;
  
  -- Validate the promo code
  SELECT * INTO v_validation
  FROM validate_promo_code(UPPER(v_promo_code));
  
  -- If invalid, log and return
  IF NOT v_validation.is_valid THEN
    RAISE NOTICE 'Promo code % is invalid for user %: %', v_promo_code, NEW.id, v_validation.error_message;
    RETURN NEW;
  END IF;
  
  -- Check if user has already redeemed this code
  SELECT * INTO v_existing_redemption
  FROM promotional_code_redemptions
  WHERE code_id = v_validation.code_id
    AND user_id = NEW.id;
  
  -- If already redeemed, return
  IF FOUND THEN
    RETURN NEW;
  END IF;
  
  -- Create redemption record
  INSERT INTO promotional_code_redemptions (
    code_id,
    user_id,
    ip_address,
    user_agent
  ) VALUES (
    v_validation.code_id,
    NEW.id,
    NULL,  -- IP not available in trigger context
    NULL   -- User agent not available in trigger context
  );
  
  -- Update promo code usage count
  UPDATE promotional_codes
  SET 
    current_uses = current_uses + 1,
    updated_at = NOW()
  WHERE id = v_validation.code_id;
  
  -- Grant promotional internships to user profile
  NEW.promotional_internships_remaining := v_validation.internships_to_grant;
  NEW.promo_code_used := UPPER(v_promo_code);
  
  -- Update feedback consent if provided
  IF v_feedback_consent = TRUE THEN
    NEW.feedback_consent := TRUE;
    NEW.feedback_consent_date := NOW();
  END IF;
  
  RAISE NOTICE 'Successfully auto-redeemed promo code % for user %', v_promo_code, NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail profile creation
    RAISE NOTICE 'Error auto-redeeming promo code for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger that fires AFTER profile INSERT
-- Note: Using BEFORE trigger so we can modify NEW values
DROP TRIGGER IF EXISTS auto_redeem_promo_code_on_profile_creation ON profiles;

CREATE TRIGGER auto_redeem_promo_code_on_profile_creation
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_promo_code();

-- Add comment for documentation
COMMENT ON FUNCTION handle_new_user_promo_code() IS 
  'Automatically redeems promo codes stored in user metadata when a new profile is created';

