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
