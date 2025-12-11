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
