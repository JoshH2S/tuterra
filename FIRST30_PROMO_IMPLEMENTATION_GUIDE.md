# FIRST30 Promotional Campaign - Complete Implementation Guide

## Campaign Overview

**Promotion:** First 30 users to sign up with promo code "FIRST30" get 1 free virtual internship  
**Start Date:** December 10, 2025  
**Promo Code:** `FIRST30`  
**Slots Available:** 30  
**Feedback Requirement:** Users must consent to email feedback survey after ~1 month  

---

## Table of Contents

1. [Database Schema Changes](#1-database-schema-changes)
2. [Promo Code System](#2-promo-code-system)
3. [Signup Flow Integration](#3-signup-flow-integration)
4. [Header Badge Implementation](#4-header-badge-implementation)
5. [Internship Creation Logic](#5-internship-creation-logic)
6. [Feedback Collection System](#6-feedback-collection-system)
7. [Testing & Validation](#7-testing--validation)
8. [Deployment Steps](#8-deployment-steps)

---

## 1. Database Schema Changes

### Step 1.1: Create Migration File

**Create:** `supabase/migrations/[timestamp]_add_first30_promo_system.sql`

```sql
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
  NULL,                       -- No expiration (or set '2026-01-10 00:00:00+00' for 1 month)
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

-- Grant service role full access for edge functions
GRANT ALL ON promotional_codes TO service_role;
GRANT ALL ON promotional_code_redemptions TO service_role;
GRANT ALL ON promotional_feedback_reminders TO service_role;

-- Grant authenticated users select on promo codes
GRANT SELECT ON promotional_codes TO authenticated;
GRANT SELECT, INSERT ON promotional_code_redemptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON promotional_feedback_reminders TO authenticated;

-- ============================================================================
-- Sample Queries for Admin
-- ============================================================================

-- Check FIRST30 campaign status
-- SELECT 
--   code,
--   current_uses || '/' || max_uses as usage,
--   starts_at,
--   expires_at,
--   CASE 
--     WHEN current_uses >= max_uses THEN 'FULL'
--     WHEN starts_at > NOW() THEN 'NOT STARTED'
--     WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 'EXPIRED'
--     ELSE 'ACTIVE'
--   END as status
-- FROM promotional_codes
-- WHERE code = 'FIRST30';

-- List all users who redeemed FIRST30
-- SELECT 
--   p.email,
--   p.first_name,
--   p.last_name,
--   p.promotional_internships_remaining,
--   p.feedback_consent,
--   r.redeemed_at
-- FROM promotional_code_redemptions r
-- JOIN promotional_codes pc ON r.code_id = pc.id
-- JOIN profiles p ON r.user_id = p.id
-- WHERE pc.code = 'FIRST30'
-- ORDER BY r.redeemed_at;

-- Check promotional internships created
-- SELECT 
--   p.email,
--   i.job_title,
--   i.industry,
--   i.promo_code,
--   i.created_at
-- FROM internship_sessions i
-- JOIN profiles p ON i.user_id = p.id
-- WHERE i.is_promotional = TRUE
--   AND i.promo_code = 'FIRST30'
-- ORDER BY i.created_at;
```

---

## 2. Promo Code System

### Step 2.1: Create Promo Code Hook

**Create:** `src/hooks/usePromoCode.ts`

```typescript
import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface PromoCodeValidation {
  isValid: boolean;
  errorMessage: string | null;
  internshipsToGrant: number;
}

export const usePromoCode = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<PromoCodeValidation | null>(null);

  const validateCode = useCallback(async (code: string): Promise<PromoCodeValidation> => {
    if (!code || !code.trim()) {
      return {
        isValid: false,
        errorMessage: "Please enter a promo code",
        internshipsToGrant: 0,
      };
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('validate_promo_code', {
        p_code: code.toUpperCase()
      });

      if (error) throw error;

      const result = {
        isValid: data.is_valid,
        errorMessage: data.error_message,
        internshipsToGrant: data.internships_to_grant || 0,
      };

      setValidationResult(result);
      return result;
    } catch (error: any) {
      console.error('Error validating promo code:', error);
      const result = {
        isValid: false,
        errorMessage: "Failed to validate promo code. Please try again.",
        internshipsToGrant: 0,
      };
      setValidationResult(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const redeemCode = useCallback(async (
    code: string,
    feedbackConsent: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "You must be signed in to redeem a promo code" };
    }

    setLoading(true);
    try {
      // First validate
      const validation = await validateCode(code);
      if (!validation.isValid) {
        return { success: false, error: validation.errorMessage || "Invalid promo code" };
      }

      // Redeem the code
      const { data, error } = await supabase.rpc('redeem_promo_code', {
        p_user_id: user.id,
        p_code: code.toUpperCase(),
        p_ip_address: null, // Could get from API
        p_user_agent: navigator.userAgent
      });

      if (error) throw error;

      if (!data.success) {
        return { success: false, error: data.error_message };
      }

      // Update feedback consent
      if (feedbackConsent) {
        const { error: consentError } = await supabase
          .from('profiles')
          .update({
            feedback_consent: true,
            feedback_consent_date: new Date().toISOString()
          })
          .eq('id', user.id);

        if (consentError) {
          console.error('Error updating feedback consent:', consentError);
          // Don't fail redemption if consent update fails
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error redeeming promo code:', error);
      return { success: false, error: error.message || "Failed to redeem promo code" };
    } finally {
      setLoading(false);
    }
  }, [user, validateCode]);

  return {
    validateCode,
    redeemCode,
    loading,
    validationResult,
  };
};
```

### Step 2.2: Create Promotional Internships Hook

**Create:** `src/hooks/usePromotionalInternships.ts`

```typescript
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface PromotionalStatus {
  hasPromotionalInternships: boolean;
  internshipsRemaining: number;
  promoCodeUsed: string | null;
  feedbackConsent: boolean;
}

export const usePromotionalInternships = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<PromotionalStatus>({
    hasPromotionalInternships: false,
    internshipsRemaining: 0,
    promoCodeUsed: null,
    feedbackConsent: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!user) {
      setStatus({
        hasPromotionalInternships: false,
        internshipsRemaining: 0,
        promoCodeUsed: null,
        feedbackConsent: false,
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('promotional_internships_remaining, promo_code_used, feedback_consent')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setStatus({
        hasPromotionalInternships: (data?.promotional_internships_remaining || 0) > 0,
        internshipsRemaining: data?.promotional_internships_remaining || 0,
        promoCodeUsed: data?.promo_code_used || null,
        feedbackConsent: data?.feedback_consent || false,
      });
    } catch (error) {
      console.error('Error fetching promotional status:', error);
      setStatus({
        hasPromotionalInternships: false,
        internshipsRemaining: 0,
        promoCodeUsed: null,
        feedbackConsent: false,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const decrementPromotionalInternship = async (): Promise<boolean> => {
    if (!user || status.internshipsRemaining <= 0) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          promotional_internships_remaining: status.internshipsRemaining - 1 
        })
        .eq('id', user.id);

      if (error) throw error;

      setStatus(prev => ({
        ...prev,
        internshipsRemaining: prev.internshipsRemaining - 1,
        hasPromotionalInternships: prev.internshipsRemaining - 1 > 0,
      }));

      return true;
    } catch (error) {
      console.error('Error decrementing promotional internship:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Set up realtime subscription for changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('promotional_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newData = payload.new as any;
          setStatus({
            hasPromotionalInternships: (newData.promotional_internships_remaining || 0) > 0,
            internshipsRemaining: newData.promotional_internships_remaining || 0,
            promoCodeUsed: newData.promo_code_used || null,
            feedbackConsent: newData.feedback_consent || false,
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  return {
    status,
    loading,
    refetch: fetchStatus,
    decrementPromotionalInternship,
  };
};
```

---

## 3. Signup Flow Integration

### Step 3.1: Update Signup Form Types

**Update:** `src/hooks/useSignUpForm.ts`

Add promo code and feedback consent state:

```typescript
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validatePasswordStrength, type PasswordStrength } from "@/lib/password";
import { usePromoCode } from "./usePromoCode";

export const useSignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // ADD THESE
  const [promoCode, setPromoCode] = useState("");
  const [feedbackConsent, setFeedbackConsent] = useState(false);
  const [promoCodeApplied, setPromoCodeApplied] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [formError, setFormError] = useState("");
  const { toast } = useToast();
  
  // ADD THIS
  const { validateCode, redeemCode } = usePromoCode();

  const validatePassword = () => {
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    const strength = validatePasswordStrength(password);
    if (strength.score < 2) {
      setPasswordError("Password is too weak. " + strength.feedback);
      return false;
    }
    setPasswordError("");
    return true;
  };

  const checkExistingUser = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy-password-to-check'
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return 'not_found';
        }
        if (error.message.includes('Email not confirmed')) {
          return 'unverified';
        }
        return 'error';
      }
      
      if (data?.user) {
        await supabase.auth.signOut();
        return 'exists';
      }
      
      return 'not_found';
    } catch (error) {
      console.error('Error checking user:', error);
      return 'not_found';
    }
  };

  // ADD THIS FUNCTION
  const handlePromoCodeValidation = async () => {
    if (!promoCode.trim()) {
      setPromoCodeApplied(false);
      return true;
    }

    const validation = await validateCode(promoCode);
    if (!validation.isValid) {
      setFormError(validation.errorMessage || "Invalid promo code");
      toast({
        title: "Invalid Promo Code",
        description: validation.errorMessage || "Please check your promo code and try again",
        variant: "destructive",
      });
      return false;
    }

    // Check if FIRST30 requires feedback consent
    if (promoCode.toUpperCase() === 'FIRST30' && !feedbackConsent) {
      setFormError("You must consent to feedback collection to use this promo code");
      toast({
        title: "Feedback Consent Required",
        description: "The FIRST30 promo requires feedback consent",
        variant: "destructive",
      });
      return false;
    }

    setPromoCodeApplied(true);
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (!validatePassword()) {
      return;
    }

    // ADD PROMO CODE VALIDATION
    const promoValid = await handlePromoCodeValidation();
    if (!promoValid) {
      return;
    }
    
    setLoading(true);
    
    try {
      const userStatus = await checkExistingUser(email);
      
      if (userStatus === 'not_found') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              user_type: "student",
              subscription_tier: "free",
              // STORE PROMO INFO IN METADATA
              promo_code: promoCode.toUpperCase() || null,
              feedback_consent: feedbackConsent,
            },
            emailRedirectTo: `${window.location.origin}/verify-email`
          },
        });

        if (error) throw error;
        
        if (data?.user) {
          // REDEEM PROMO CODE AFTER SIGNUP
          if (promoCode.trim() && promoCodeApplied) {
            const redemption = await redeemCode(promoCode, feedbackConsent);
            if (!redemption.success) {
              console.error('Failed to redeem promo code:', redemption.error);
              // Don't block signup if redemption fails, just log it
              toast({
                title: "Note",
                description: "Account created, but promo code redemption failed. Contact support.",
                variant: "default",
              });
            }
          }

          setVerificationSent(true);
          toast({
            title: "Verification email sent!",
            description: promoCodeApplied 
              ? "Please check your inbox. Your promo code will be applied after verification."
              : "Please check your inbox and verify your email to continue.",
          });
          
          localStorage.setItem("pendingVerificationEmail", email);
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setFormError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    // ADD THESE
    promoCode,
    setPromoCode,
    feedbackConsent,
    setFeedbackConsent,
    promoCodeApplied,
    loading,
    passwordError,
    setPasswordError,
    passwordStrength,
    passwordTouched,
    setPasswordTouched,
    validatePassword,
    handleSignUp,
    verificationSent,
    formError
  };
};
```

### Step 3.2: Create Promo Code Input Component

**Create:** `src/components/auth/PromoCodeInput.tsx`

```typescript
import { Gift, Check, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

interface PromoCodeInputProps {
  promoCode: string;
  setPromoCode: (value: string) => void;
  feedbackConsent: boolean;
  setFeedbackConsent: (value: boolean) => void;
  promoCodeApplied: boolean;
  showFeedbackConsent?: boolean;
}

export const PromoCodeInput = ({
  promoCode,
  setPromoCode,
  feedbackConsent,
  setFeedbackConsent,
  promoCodeApplied,
  showFeedbackConsent = false,
}: PromoCodeInputProps) => {
  const showConsentCheckbox = promoCode.toUpperCase() === 'FIRST30';

  return (
    <div className="space-y-3">
      <div className="relative">
        <Label htmlFor="promoCode" className="text-sm font-medium">
          Promo Code (Optional)
        </Label>
        <div className="relative mt-1">
          <Gift className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="promoCode"
            placeholder="Enter promo code (e.g., FIRST30)"
            className="pl-10"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            maxLength={20}
          />
          {promoCodeApplied && (
            <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-600" />
          )}
        </div>
      </div>

      {showConsentCheckbox && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="space-y-3 pl-6">
            <p className="text-sm text-blue-900 font-medium">
              🎉 FIRST30 Promotion
            </p>
            <p className="text-sm text-blue-800">
              Get <strong>1 free virtual internship</strong> as one of our first 30 users!
            </p>
            
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="feedbackConsent"
                checked={feedbackConsent}
                onCheckedChange={(checked) => setFeedbackConsent(checked === true)}
                className="mt-0.5"
              />
              <Label
                htmlFor="feedbackConsent"
                className="text-sm text-blue-900 leading-relaxed cursor-pointer"
              >
                I consent to receiving a feedback survey via email after completing my 
                promotional internship (~1 month). This helps us improve Tuterra for 
                future students.
              </Label>
            </div>
            
            {promoCode && !feedbackConsent && (
              <p className="text-xs text-red-600 font-medium pl-6">
                * Feedback consent is required for FIRST30 promo code
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {promoCode && promoCode.toUpperCase() !== 'FIRST30' && (
        <p className="text-xs text-muted-foreground">
          Your promo code will be validated and applied after account verification
        </p>
      )}
    </div>
  );
};
```

### Step 3.3: Update SignUpForm Component

**Update:** `src/components/auth/SignUpForm.tsx`

```typescript
import { motion } from "framer-motion";
import { useState } from "react";
import { PersonalInfoInputs } from "./PersonalInfoInputs";
import { PasswordInputs } from "./PasswordInputs";
import { SubmitButton } from "./SubmitButton";
import { SignUpFormHeader } from "./SignUpFormHeader";
import { PromoCodeInput } from "./PromoCodeInput";  // ADD THIS
import { useSignUpForm } from "@/hooks/useSignUpForm";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { TermsOfUse } from "@/components/legal/TermsOfUse";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TermsAgreement } from "./TermsAgreement";
import { VerificationSentAlert } from "./VerificationSentAlert";

interface SignUpFormProps {
  onSignUpSuccess?: () => void;
}

export const SignUpForm = ({ onSignUpSuccess }: SignUpFormProps) => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    // ADD THESE
    promoCode,
    setPromoCode,
    feedbackConsent,
    setFeedbackConsent,
    promoCodeApplied,
    loading,
    passwordError,
    setPasswordError,
    passwordStrength,
    passwordTouched,
    setPasswordTouched,
    validatePassword,
    handleSignUp,
    verificationSent,
    formError
  } = useSignUpForm();

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const { toast } = useToast();

  const handleResendVerification = async () => {
    try {
      setResendingEmail(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: window.location.origin + "/verify-email"
        }
      });

      if (error) throw error;

      toast({
        title: "Verification email resent",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: any) {
      console.error('Failed to resend verification:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    await handleSignUp(e);
    if (verificationSent) {
      onSignUpSuccess?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <SignUpFormHeader />

      {verificationSent ? (
        <VerificationSentAlert 
          email={email}
          onResend={handleResendVerification}
          isResending={resendingEmail}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <PersonalInfoInputs
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              email={email}
              setEmail={setEmail}
            />

            <PasswordInputs
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              passwordError={passwordError}
              setPasswordError={setPasswordError}
              passwordStrength={passwordStrength}
              passwordTouched={passwordTouched}
              setPasswordTouched={setPasswordTouched}
              validatePassword={validatePassword}
            />

            {/* ADD THIS */}
            <PromoCodeInput
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              feedbackConsent={feedbackConsent}
              setFeedbackConsent={setFeedbackConsent}
              promoCodeApplied={promoCodeApplied}
            />
          </div>

          <TermsAgreement
            agreed={agreedToTerms}
            onAgreeChange={setAgreedToTerms}
            onShowTerms={() => setShowTerms(true)}
            onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)}
          />

          <SubmitButton loading={loading} disabled={!agreedToTerms} />
        </form>
      )}

      <Dialog open={showPrivacyPolicy} onOpenChange={setShowPrivacyPolicy}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogTitle>Privacy Policy</DialogTitle>
          <PrivacyPolicy />
        </DialogContent>
      </Dialog>

      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogTitle>Terms of Use</DialogTitle>
          <TermsOfUse />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
```

---

## 4. Header Badge Implementation

### Step 4.1: Create Promotional Badge Component

**Create:** `src/components/promotional/PromotionalBadge.tsx`

```typescript
import { Gift, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface PromotionalBadgeProps {
  internshipsRemaining: number;
  promoCode: string | null;
  compact?: boolean;
}

export const PromotionalBadge = ({ 
  internshipsRemaining, 
  promoCode,
  compact = false 
}: PromotionalBadgeProps) => {
  const navigate = useNavigate();

  if (internshipsRemaining <= 0) return null;

  const handleClick = () => {
    navigate('/dashboard/virtual-internship/new');
  };

  if (compact) {
    // Mobile version
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClick}
              className="cursor-pointer"
            >
              <Badge 
                variant="default" 
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 gap-1 px-2 py-1"
              >
                <Gift className="h-3 w-3" />
                <span className="text-xs font-semibold">{internshipsRemaining}</span>
              </Badge>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm font-medium">
              {internshipsRemaining} Free Virtual Internship{internshipsRemaining > 1 ? 's' : ''}
            </p>
            {promoCode && (
              <p className="text-xs text-muted-foreground">Promo: {promoCode}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Desktop version
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="cursor-pointer"
    >
      <Badge 
        variant="default" 
        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 gap-2 px-3 py-1.5 shadow-md"
      >
        <Gift className="h-4 w-4" />
        <div className="flex flex-col items-start leading-tight">
          <span className="text-xs font-semibold">
            {internshipsRemaining} Free Internship{internshipsRemaining > 1 ? 's' : ''}
          </span>
          {promoCode && (
            <span className="text-[10px] opacity-90">
              {promoCode}
            </span>
          )}
        </div>
        <Sparkles className="h-3 w-3 animate-pulse" />
      </Badge>
    </motion.div>
  );
};
```

### Step 4.2: Update Desktop Header

**Update:** `src/components/layout/desktop/DesktopHeader.tsx`

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { usePromotionalInternships } from "@/hooks/usePromotionalInternships";  // ADD THIS
import { CreditsSummaryPopup } from "@/components/credits/CreditsSummaryPopup";
import { PromotionalBadge } from "@/components/promotional/PromotionalBadge";  // ADD THIS

export function DesktopHeader() {
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const { status } = usePromotionalInternships();  // ADD THIS

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

  return (
    <header className="sticky top-0 z-40 hidden lg:block border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          {/* Removing EduPortal text from here since it's already in the sidebar */}
        </div>
        <div className="flex items-center gap-4">
          {/* ADD PROMOTIONAL BADGE */}
          {status.hasPromotionalInternships && (
            <PromotionalBadge
              internshipsRemaining={status.internshipsRemaining}
              promoCode={status.promoCodeUsed}
              compact={false}
            />
          )}

          <div className={subscription?.tier === 'free' ? "" : "hidden"}>
            <CreditsSummaryPopup />
          </div>
          
          {/* Upgrade button only appears for free users */}
          {subscription?.tier === 'free' && (
            <Button
              variant="default"
              onClick={handleUpgradeClick}
              className="gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Upgrade to Pro Plan
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
```

### Step 4.3: Update Mobile Header

**Update:** `src/components/layout/mobile/MobileHeader.tsx`

```typescript
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, Search, CreditCard, Coins } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MobileSearch } from "./MobileSearch";
import { MobileMenu } from "./MobileMenu";
import { useLocation, useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { usePromotionalInternships } from "@/hooks/usePromotionalInternships";  // ADD THIS
import { CreditsBadge } from "@/components/credits/CreditsBadge";
import { CreditsSummaryPopup } from "@/components/credits/CreditsSummaryPopup";
import { PromotionalBadge } from "@/components/promotional/PromotionalBadge";  // ADD THIS

export function MobileHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const { status } = usePromotionalInternships();  // ADD THIS
  
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="mr-2 px-0 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <MobileMenu onClose={() => setIsMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2">
          <div className="font-semibold text-lg">tuterra</div>
          
          <div className="flex items-center space-x-2">
            {/* ADD PROMOTIONAL BADGE */}
            {status.hasPromotionalInternships && (
              <PromotionalBadge
                internshipsRemaining={status.internshipsRemaining}
                promoCode={status.promoCodeUsed}
                compact={true}
              />
            )}

            {subscription?.tier === 'free' && (
              <>
                <CreditsSummaryPopup />
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs h-8 px-3"
                  onClick={handleUpgradeClick}
                >
                  <CreditCard className="h-3.5 w-3.5 mr-1" />
                  Upgrade
                </Button>
              </>
            )}
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9 touch-manipulation"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </motion.button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isSearchOpen && (
            <MobileSearch onClose={() => setIsSearchOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
```

---

## 5. Internship Creation Logic

### Step 5.1: Update Internship Setup Form

**Update:** `src/components/internship/MultiStepInternshipSetupForm.tsx`

Around lines 27-35, add promotional hook:

```typescript
import { usePromotionalInternships } from "@/hooks/usePromotionalInternships";  // ADD THIS

export function MultiStepInternshipSetupForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const { status, decrementPromotionalInternship } = usePromotionalInternships();  // ADD THIS
  
  // ... rest of component
}
```

Update the access check around lines 127-131:

```typescript
const handleGenerate = async () => {
  if (!user) {
    toast({
      title: "Authentication required",
      description: "Please sign in to create an internship",
      variant: "destructive",
    });
    return;
  }

  // NEW ACCESS CHECK: Pro/Premium OR has promotional internships
  const hasAccess = 
    subscription.tier === "pro" || 
    subscription.tier === "premium" || 
    status.hasPromotionalInternships;

  if (!hasAccess) {
    setShowUpgradePrompt(true);
    return;
  }

  if (!canProceedToNext()) {
    toast({
      title: "Please complete all fields",
      description: "Fill in all required information before creating your internship.",
      variant: "destructive",
    });
    return;
  }

  const isPromotional = status.hasPromotionalInternships && subscription.tier === "free";

  setIsGenerating(true);
  setGenerationProgress(10);
  
  // ... existing retry logic ...

  try {
    // ... existing code ...

    // Use the edge function to create the internship
    const response = await fetch(`https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/create-internship-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        job_title: formData.jobTitle,
        industry: formData.industry,
        job_description: formData.jobDescription,
        duration_weeks: formData.durationWeeks,
        start_date: formData.startDate,
        is_promotional: isPromotional,  // ADD THIS
        promo_code: status.promoCodeUsed  // ADD THIS
      })
    });

    // ... existing response handling ...

    // After successful creation, decrement promotional counter
    if (isPromotional && !insertError) {
      await decrementPromotionalInternship();
      
      // Schedule feedback reminder
      await supabase.rpc('schedule_feedback_reminder', {
        p_user_id: user.id,
        p_session_id: result.sessionId,
        p_days_delay: 30
      });
    }

    // ... rest of code ...
  } catch (error) {
    // ... error handling ...
  }
};
```

Update the upgrade prompt display (lines 311-375):

```typescript
// Show promotional banner if user has promotional internships
if (status.hasPromotionalInternships && !subscriptionLoading) {
  return (
    <>
      <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="w-6 h-6 text-amber-600" />
          <span className="font-bold text-lg text-amber-900">
            🎉 FIRST30 Promotion Active!
          </span>
        </div>
        <p className="text-sm text-amber-800 mb-2">
          You have <strong>{status.internshipsRemaining} free virtual internship{status.internshipsRemaining > 1 ? 's' : ''}</strong> available.
        </p>
        {status.feedbackConsent && (
          <p className="text-xs text-amber-700">
            📧 We'll send you a feedback survey after you complete your internship. Thank you for helping us improve!
          </p>
        )}
      </div>
      
      {/* Render normal form */}
      <div ref={formRef} className="w-full max-w-4xl mx-auto">
        {/* ... existing form code ... */}
      </div>
    </>
  );
}

// Show upgrade prompt for free users WITHOUT promotional access
const isFreeTier = subscription.tier === "free" && !status.hasPromotionalInternships;

if (isFreeTier && !subscriptionLoading) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        {/* ... existing upgrade prompt ... */}
      </Card>
    </div>
  );
}
```

### Step 5.2: Update Edge Function

**Update:** `supabase/functions/create-internship-session/index.ts`

Around lines 140-197, add promotional validation:

```typescript
serve(async (req) => {
  // ... CORS handling ...

  try {
    // ... auth check ...

    // Parse request body
    const { 
      job_title, 
      industry, 
      job_description, 
      duration_weeks, 
      start_date,
      is_promotional = false,  // ADD THIS
      promo_code = null  // ADD THIS
    } = await req.json();

    // ... existing validation ...

    // NEW: Server-side access check
    console.log('🔐 Checking user access...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, promotional_internships_remaining, promo_code_used')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return new Response(JSON.stringify({ 
        error: "Failed to verify subscription",
        details: profileError.message 
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      });
    }

    const hasAccess = 
      profile.subscription_tier === 'pro' ||
      profile.subscription_tier === 'premium' ||
      (is_promotional && profile.promotional_internships_remaining > 0);

    if (!hasAccess) {
      console.log('❌ Access denied - no subscription or promotional internships');
      return new Response(JSON.stringify({ 
        error: "Subscription required",
        details: "Virtual internships require a Pro/Premium subscription or a promotional code"
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403 
      });
    }

    console.log('✅ Access granted:', {
      tier: profile.subscription_tier,
      isPromotional: is_promotional,
      promoRemaining: profile.promotional_internships_remaining
    });

    // Insert into internship_sessions table
    const { data: sessionData, error: insertError } = await supabase
      .from("internship_sessions")
      .insert({
        user_id: user.id,
        job_title,
        industry,
        job_description,
        duration_weeks,
        start_date,
        current_phase: 1,
        is_promotional,  // ADD THIS
        promo_code  // ADD THIS
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      });
    }

    console.log(`✅ Internship session created with ID: ${sessionData.id}`);

    // If promotional, decrement the counter
    if (is_promotional && profile.promotional_internships_remaining > 0) {
      console.log('📉 Decrementing promotional internship counter');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          promotional_internships_remaining: profile.promotional_internships_remaining - 1 
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to decrement promotional counter:', updateError);
        // Don't fail the request, just log it
      } else {
        console.log('✅ Promotional internship counter decremented');
      }

      // Schedule feedback reminder
      console.log('📅 Scheduling feedback reminder');
      const { error: reminderError } = await supabase.rpc('schedule_feedback_reminder', {
        p_user_id: user.id,
        p_session_id: sessionData.id,
        p_days_delay: 30
      });

      if (reminderError) {
        console.error('Failed to schedule feedback reminder:', reminderError);
        // Don't fail the request
      } else {
        console.log('✅ Feedback reminder scheduled');
      }
    }

    // ... rest of internship generation logic ...
  } catch (error) {
    // ... error handling ...
  }
});
```

---

## 6. Feedback Collection System

### Step 6.1: Create Feedback Email Template

**Create:** `supabase/functions/send-promotional-feedback-email/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all pending feedback reminders
    const { data: reminders, error: remindersError } = await supabase
      .from('promotional_feedback_reminders')
      .select(`
        *,
        profiles!inner(email, first_name, last_name),
        internship_sessions!inner(job_title, industry)
      `)
      .lte('scheduled_for', new Date().toISOString())
      .is('sent_at', null)
      .limit(50);

    if (remindersError) {
      console.error('Error fetching reminders:', remindersError);
      throw remindersError;
    }

    console.log(`Found ${reminders?.length || 0} feedback reminders to send`);

    const results = [];

    for (const reminder of reminders || []) {
      try {
        const { email, first_name } = reminder.profiles;
        const { job_title, industry } = reminder.internship_sessions;

        // Create feedback form URL with pre-filled data
        const feedbackUrl = `${Deno.env.get('PUBLIC_SITE_URL')}/feedback/promotional?session=${reminder.internship_session_id}&user=${reminder.user_id}`;

        // Send email via your email service (e.g., Resend, SendGrid)
        // This is a placeholder - integrate with your email service
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Tuterra <noreply@tuterra.ai>',
            to: email,
            subject: `Share Your Experience - ${job_title} Virtual Internship Feedback`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; }
                    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>🎉 Thank You for Being One of Our First!</h1>
                    </div>
                    <div class="content">
                      <p>Hi ${first_name},</p>
                      
                      <p>About a month ago, you completed your <strong>${job_title}</strong> virtual internship in the <strong>${industry}</strong> industry as one of our first 30 users with the FIRST30 promo code.</p>
                      
                      <p>We'd love to hear about your experience! Your feedback will directly shape how we improve Tuterra for future students.</p>
                      
                      <p><strong>The survey takes just 3-5 minutes</strong> and covers:</p>
                      <ul>
                        <li>Overall satisfaction with your virtual internship</li>
                        <li>Features you found most helpful</li>
                        <li>Areas where we can improve</li>
                        <li>Would you recommend Tuterra to others?</li>
                      </ul>
                      
                      <center>
                        <a href="${feedbackUrl}" class="button">Share Your Feedback</a>
                      </center>
                      
                      <p><strong>As a thank you</strong>, everyone who completes the survey will be entered to win one of three $50 Amazon gift cards! 🎁</p>
                      
                      <p>Thank you for helping us build a better learning experience!</p>
                      
                      <p>Best regards,<br>
                      The Tuterra Team</p>
                    </div>
                    <div class="footer">
                      <p>This email was sent because you consented to feedback collection when signing up with the FIRST30 promo code.</p>
                      <p>© ${new Date().getFullYear()} Tuterra. All rights reserved.</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          }),
        });

        if (!emailResponse.ok) {
          throw new Error(`Email service error: ${await emailResponse.text()}`);
        }

        // Mark reminder as sent
        await supabase
          .from('promotional_feedback_reminders')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', reminder.id);

        // Update profile
        await supabase
          .from('profiles')
          .update({ 
            feedback_email_sent: true,
            feedback_email_sent_at: new Date().toISOString()
          })
          .eq('id', reminder.user_id);

        results.push({ success: true, email, reminder_id: reminder.id });
        console.log(`✅ Sent feedback email to ${email}`);

      } catch (error: any) {
        console.error(`❌ Failed to send to ${reminder.profiles.email}:`, error);
        results.push({ success: false, email: reminder.profiles.email, error: error.message });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      processed: results.length,
      results 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
```

### Step 6.2: Create Feedback Form Page

**Create:** `src/pages/PromotionalFeedback.tsx`

```typescript
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Star, Sparkles, CheckCircle2 } from "lucide-react";

export default function PromotionalFeedback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const sessionId = searchParams.get('session');
  const userId = searchParams.get('user');
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    overallSatisfaction: "",
    mostHelpfulFeatures: [] as string[],
    improvementSuggestions: "",
    wouldRecommend: "",
    additionalComments: "",
  });

  useEffect(() => {
    // Check if already submitted
    const checkSubmission = async () => {
      if (!sessionId || !userId) return;

      const { data } = await supabase
        .from('promotional_feedback_reminders')
        .select('feedback_submitted')
        .eq('internship_session_id', sessionId)
        .eq('user_id', userId)
        .single();

      if (data?.feedback_submitted) {
        setSubmitted(true);
      }
    };

    checkSubmission();
  }, [sessionId, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionId || !userId) {
      toast({
        title: "Error",
        description: "Invalid feedback link",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Store feedback
      const { error: feedbackError } = await supabase
        .from('promotional_feedback_reminders')
        .update({
          feedback_submitted: true,
          feedback_submitted_at: new Date().toISOString(),
        })
        .eq('internship_session_id', sessionId)
        .eq('user_id', userId);

      if (feedbackError) throw feedbackError;

      // Store detailed feedback in a separate table (create if needed)
      // Or send to your analytics service

      setSubmitted(true);
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });

    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Thank You!</h2>
            <p className="text-muted-foreground">
              Your feedback has been submitted successfully. You've been entered into our gift card drawing!
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-amber-600" />
              <CardTitle>FIRST30 Feedback Survey</CardTitle>
            </div>
            <CardDescription>
              Help us improve Tuterra! Your feedback takes 3-5 minutes and you'll be entered to win a $50 Amazon gift card.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Overall Satisfaction */}
              <div className="space-y-3">
                <Label>Overall, how satisfied were you with your virtual internship experience?</Label>
                <RadioGroup 
                  value={formData.overallSatisfaction}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, overallSatisfaction: value }))}
                >
                  {['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="cursor-pointer">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Most Helpful Features */}
              <div className="space-y-3">
                <Label>Which features did you find most helpful? (Select all that apply)</Label>
                <div className="space-y-2">
                  {[
                    'AI Supervisor feedback',
                    'Realistic workplace tasks',
                    'Progress tracking',
                    'Skills development',
                    'Company profile details',
                    'Email messaging system',
                  ].map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature}
                        checked={formData.mostHelpfulFeatures.includes(feature)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              mostHelpfulFeatures: [...prev.mostHelpfulFeatures, feature]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              mostHelpfulFeatures: prev.mostHelpfulFeatures.filter(f => f !== feature)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={feature} className="cursor-pointer">{feature}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Suggestions */}
              <div className="space-y-3">
                <Label htmlFor="improvements">What could we improve?</Label>
                <Textarea
                  id="improvements"
                  value={formData.improvementSuggestions}
                  onChange={(e) => setFormData(prev => ({ ...prev, improvementSuggestions: e.target.value }))}
                  placeholder="Share your suggestions..."
                  rows={4}
                />
              </div>

              {/* Would Recommend */}
              <div className="space-y-3">
                <Label>Would you recommend Tuterra to other students?</Label>
                <RadioGroup 
                  value={formData.wouldRecommend}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, wouldRecommend: value }))}
                >
                  {['Definitely', 'Probably', 'Not Sure', 'Probably Not', 'Definitely Not'].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`recommend-${option}`} />
                      <Label htmlFor={`recommend-${option}`} className="cursor-pointer">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Additional Comments */}
              <div className="space-y-3">
                <Label htmlFor="comments">Any additional comments?</Label>
                <Textarea
                  id="comments"
                  value={formData.additionalComments}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalComments: e.target.value }))}
                  placeholder="Share anything else you'd like us to know..."
                  rows={4}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !formData.overallSatisfaction || !formData.wouldRecommend}
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
```

### Step 6.3: Schedule Feedback Emails (Cron Job)

**Create:** `supabase/functions/_cron-send-feedback-emails/index.ts`

```typescript
// This function is triggered by Supabase Cron
// Set up in Dashboard: Database > Cron Jobs
// Schedule: 0 9 * * * (daily at 9 AM UTC)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // Forward to the send-promotional-feedback-email function
  const response = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-promotional-feedback-email`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
    }
  );

  const result = await response.json();
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

## 7. Testing & Validation

### Step 7.1: Testing Checklist

#### Database Setup
- [ ] Migration applied successfully
- [ ] FIRST30 promo code created with max_uses = 30
- [ ] All tables created (promotional_codes, promotional_code_redemptions, promotional_feedback_reminders)
- [ ] RLS policies enabled and working

#### Signup Flow
- [ ] Promo code input field appears on signup form
- [ ] Entering "FIRST30" shows feedback consent checkbox
- [ ] Cannot submit without feedback consent when using FIRST30
- [ ] Promo code is case-insensitive
- [ ] User receives verification email after signup
- [ ] After verification, promotional_internships_remaining = 1

#### Promo Code Validation
- [ ] Invalid code shows error message
- [ ] FIRST30 shows "1 free internship" message
- [ ] Code with 30/30 uses shows "usage limit reached"
- [ ] Code cannot be redeemed twice by same user

#### Header Badge
- [ ] Badge appears in desktop header after redemption
- [ ] Badge appears in mobile header (compact version)
- [ ] Badge shows correct count (decrements after use)
- [ ] Badge shows promo code used ("FIRST30")
- [ ] Clicking badge navigates to internship creation
- [ ] Badge disappears when internships_remaining = 0

#### Internship Creation
- [ ] Free user with promo can create internship
- [ ] Free user without promo sees upgrade prompt
- [ ] Pro user can create unlimited internships
- [ ] Promotional counter decrements after creation
- [ ] internship_sessions.is_promotional = true
- [ ] internship_sessions.promo_code = "FIRST30"
- [ ] Feedback reminder scheduled for 30 days

#### Feedback System
- [ ] Feedback reminder created after internship creation
- [ ] Email sent 30 days after creation
- [ ] Feedback form accessible via email link
- [ ] Form shows internship details
- [ ] Submission marks feedback_submitted = true
- [ ] Cannot submit feedback twice

#### Edge Cases
- [ ] User tries to create 2nd internship (should require upgrade)
- [ ] User with Pro subscription doesn't see promo badge
- [ ] Promo code expires_at handled correctly
- [ ] Server-side validation prevents unauthorized access
- [ ] Race condition: 2 users redeeming 30th slot

### Step 7.2: SQL Queries for Testing

```sql
-- Check FIRST30 status
SELECT 
  code,
  current_uses || '/' || max_uses as usage,
  starts_at,
  expires_at,
  metadata->>'campaign' as campaign
FROM promotional_codes
WHERE code = 'FIRST30';

-- List all FIRST30 users
SELECT 
  p.email,
  p.first_name,
  p.last_name,
  p.promotional_internships_remaining as remaining,
  p.feedback_consent,
  p.promo_code_used,
  p.created_at,
  r.redeemed_at
FROM profiles p
LEFT JOIN promotional_code_redemptions r ON p.id = r.user_id
LEFT JOIN promotional_codes pc ON r.code_id = pc.id AND pc.code = 'FIRST30'
WHERE p.promo_code_used = 'FIRST30'
ORDER BY r.redeemed_at ASC;

-- Check promotional internships created
SELECT 
  i.id,
  p.email,
  i.job_title,
  i.industry,
  i.promo_code,
  i.is_promotional,
  i.created_at
FROM internship_sessions i
JOIN profiles p ON i.user_id = p.id
WHERE i.promo_code = 'FIRST30'
ORDER BY i.created_at;

-- Check feedback reminders
SELECT 
  f.id,
  p.email,
  i.job_title,
  f.scheduled_for,
  f.sent_at,
  f.feedback_submitted,
  f.feedback_submitted_at
FROM promotional_feedback_reminders f
JOIN profiles p ON f.user_id = p.id
JOIN internship_sessions i ON f.internship_session_id = i.id
WHERE i.promo_code = 'FIRST30'
ORDER BY f.scheduled_for;

-- Manually grant promo to specific user (for testing)
UPDATE profiles
SET promotional_internships_remaining = 1,
    promo_code_used = 'FIRST30',
    feedback_consent = true,
    feedback_consent_date = NOW()
WHERE email = 'test@example.com';

-- Reset a user's promo (for testing)
UPDATE profiles
SET promotional_internships_remaining = 0,
    promo_code_used = NULL,
    feedback_consent = false,
    feedback_consent_date = NULL
WHERE email = 'test@example.com';

DELETE FROM promotional_code_redemptions
WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@example.com');

UPDATE promotional_codes
SET current_uses = current_uses - 1
WHERE code = 'FIRST30';
```

---

## 8. Deployment Steps

### Step 8.1: Pre-Deployment Checklist

- [ ] All code reviewed and tested locally
- [ ] Database migration tested on staging
- [ ] TypeScript types regenerated
- [ ] No linting errors
- [ ] Edge functions deployed and tested
- [ ] Email service configured (Resend API key)
- [ ] Cron job scheduled in Supabase
- [ ] Backup database before migration

### Step 8.2: Deployment Commands

```bash
# 1. Apply database migration
cd /Users/jmugh/tuterra-2
supabase db push

# 2. Regenerate TypeScript types
supabase gen types typescript --local > src/integrations/supabase/types.ts

# 3. Deploy edge functions
supabase functions deploy create-internship-session
supabase functions deploy send-promotional-feedback-email

# 4. Set environment secrets
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
supabase secrets set PUBLIC_SITE_URL=https://tuterra.ai

# 5. Verify deployment
supabase functions list

# 6. Test edge function
curl -i --location --request POST \
  'https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/send-promotional-feedback-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'

# 7. Build and deploy frontend
npm run build
# Deploy to your hosting (Vercel, Netlify, etc.)
```

### Step 8.3: Post-Deployment Verification

1. **Test Signup Flow:**
   - Go to /auth?tab=signup
   - Fill in details
   - Enter "FIRST30" in promo code
   - Check feedback consent appears
   - Complete signup
   - Verify email and check database

2. **Test Promo Redemption:**
   - Log in as new user
   - Check header shows promotional badge
   - Navigate to create internship
   - Verify promotional banner shows
   - Create internship
   - Check counter decrements

3. **Test Access Control:**
   - Try to create 2nd internship (should require upgrade)
   - Log out
   - Try to access internship creation directly
   - Should be redirected to auth

4. **Monitor Logs:**
```bash
# Watch edge function logs
supabase functions logs create-internship-session --tail
supabase functions logs send-promotional-feedback-email --tail
```

### Step 8.4: Schedule Cron Job

In Supabase Dashboard:
1. Go to Database > Cron Jobs
2. Click "Create Cron Job"
3. Schedule: `0 9 * * *` (daily at 9 AM UTC)
4. SQL Command:
```sql
SELECT net.http_post(
  url := 'https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/send-promotional-feedback-email',
  headers := jsonb_build_object(
    'Authorization', 'Bearer ' || current_setting('app.service_role_key')
  )
);
```

---

## Summary

This implementation provides:

✅ **Promo Code System** - FIRST30 code for first 30 users  
✅ **Signup Integration** - Promo code field with feedback consent  
✅ **Header Badge** - Visual indicator of promotional internships  
✅ **Access Control** - Server-side validation preventing abuse  
✅ **Feedback Collection** - Automated email system after 30 days  
✅ **Database Tracking** - Complete audit trail of redemptions  
✅ **Mobile Responsive** - Works on all devices  

**Campaign Launch:** December 10, 2025  
**Slots Available:** 30  
**Feedback Timing:** 30 days after internship creation  

**Admin Queries:** See Section 7.2 for monitoring campaign status  
**Estimated Development Time:** 12-16 hours  

---

**Questions or Issues?** Refer to the SQL queries in Section 7.2 for debugging and monitoring the campaign.

