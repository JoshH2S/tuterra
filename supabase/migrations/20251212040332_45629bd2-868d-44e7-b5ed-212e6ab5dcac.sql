-- Auto-redeem promo codes when a new user profile is created
-- This trigger reads promo_code from auth.users.raw_user_meta_data and applies it

CREATE OR REPLACE FUNCTION public.handle_new_user_promo_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_promo_code TEXT;
  v_feedback_consent BOOLEAN;
  v_validation RECORD;
  v_user_metadata JSONB;
BEGIN
  -- Get user metadata from auth.users
  SELECT raw_user_meta_data INTO v_user_metadata
  FROM auth.users
  WHERE id = NEW.id;
  
  -- Extract promo code and consent from metadata
  v_promo_code := UPPER(TRIM(v_user_metadata->>'promo_code'));
  v_feedback_consent := COALESCE((v_user_metadata->>'feedback_consent')::BOOLEAN, FALSE);
  
  -- If no promo code, return without modification
  IF v_promo_code IS NULL OR v_promo_code = '' THEN
    RETURN NEW;
  END IF;
  
  -- Validate the promo code
  SELECT * INTO v_validation
  FROM validate_promo_code(v_promo_code);
  
  -- If valid, apply the promo
  IF v_validation.is_valid THEN
    -- Set the promotional fields on the new profile
    NEW.promotional_internships_remaining := v_validation.internships_to_grant;
    NEW.promo_code_used := v_promo_code;
    NEW.feedback_consent := v_feedback_consent;
    NEW.feedback_consent_date := CASE WHEN v_feedback_consent THEN NOW() ELSE NULL END;
    
    -- Create redemption record
    INSERT INTO promotional_code_redemptions (
      code_id,
      user_id,
      ip_address,
      user_agent
    ) VALUES (
      v_validation.code_id,
      NEW.id,
      NULL,
      NULL
    );
    
    -- Increment the promo code usage count
    UPDATE promotional_codes
    SET current_uses = current_uses + 1
    WHERE id = v_validation.code_id;
    
    RAISE NOTICE 'Promo code % applied for user %: % internships granted', 
      v_promo_code, NEW.id, v_validation.internships_to_grant;
  ELSE
    RAISE NOTICE 'Promo code % validation failed for user %: %', 
      v_promo_code, NEW.id, v_validation.error_message;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block profile creation
  RAISE WARNING 'Error in promo code redemption for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS auto_redeem_promo_code_on_profile_creation ON profiles;

CREATE TRIGGER auto_redeem_promo_code_on_profile_creation
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_promo_code();