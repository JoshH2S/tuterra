import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { debounce } from '@/utils/debounce';

export interface PortfolioData {
  reflectionEssay: string;
}

export function usePortfolioData(sessionId: string, userId: string) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    reflectionEssay: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load portfolio data from database and localStorage
  const loadPortfolioData = useCallback(async () => {
    if (!sessionId || !userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // First try to load from database
      const { data: dbData, error } = await supabase
        .from('internship_portfolio_data')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      // Try to load from localStorage as backup
      const localStorageKey = `portfolio_${sessionId}_${userId}`;
      const localData = localStorage.getItem(localStorageKey);
      
      let finalData: PortfolioData = { reflectionEssay: '' };

      if (dbData) {
        // Use database data if available
        finalData = {
          reflectionEssay: dbData.reflection_essay || ''
        };
      } else if (localData) {
        // Fallback to localStorage if no database data
        try {
          const parsed = JSON.parse(localData);
          finalData = {
            reflectionEssay: parsed.reflectionEssay || ''
          };
        } catch (e) {
          console.warn('Failed to parse localStorage portfolio data:', e);
        }
      }

      setPortfolioData(finalData);

      // Save to localStorage for immediate backup
      localStorage.setItem(localStorageKey, JSON.stringify(finalData));

    } catch (err) {
      console.error('Error loading portfolio data:', err);
      toast({
        title: "Load Error",
        description: "Failed to load portfolio data. Starting fresh.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [sessionId, userId, toast]);

  useEffect(() => {
    loadPortfolioData();
  }, [loadPortfolioData]);

  // Debounced save to database
  const debouncedSaveToDatabase = useCallback(
    debounce(async (dataToSave: PortfolioData) => {
      if (!sessionId || !userId) return;

      try {
        setSaving(true);

        const { error } = await supabase
          .from('internship_portfolio_data')
          .upsert({
            session_id: sessionId,
            user_id: userId,
            reflection_essay: dataToSave.reflectionEssay
          }, {
            onConflict: 'session_id,user_id'
          });

        if (error) {
          console.error('Error saving portfolio data to database:', error);
          toast({
            title: "Save Error",
            description: "Failed to save to database. Your work is saved locally.",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error('Error in debouncedSaveToDatabase:', err);
      } finally {
        setSaving(false);
      }
    }, 1000), // 1 second debounce
    [sessionId, userId, toast]
  );

  // Update portfolio data with autosave
  const updatePortfolioData = useCallback((field: keyof PortfolioData, value: string) => {
    const newData = { ...portfolioData, [field]: value };
    setPortfolioData(newData);

    // Save to localStorage immediately
    const localStorageKey = `portfolio_${sessionId}_${userId}`;
    localStorage.setItem(localStorageKey, JSON.stringify(newData));

    // Debounced save to database
    debouncedSaveToDatabase(newData);
  }, [portfolioData, sessionId, userId, debouncedSaveToDatabase]);

  // Manual save function (immediate, not debounced)
  const saveNow = useCallback(async () => {
    if (!sessionId || !userId) return false;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('internship_portfolio_data')
        .upsert({
          session_id: sessionId,
          user_id: userId,
          reflection_essay: portfolioData.reflectionEssay
        }, {
          onConflict: 'session_id,user_id'
        });

      if (error) {
        console.error('Error saving portfolio data:', error);
        toast({
          title: "Save Failed",
          description: "Failed to save your reflection essay. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Saved Successfully",
        description: "Your reflection essay has been saved.",
      });
      return true;
    } catch (err) {
      console.error('Error in saveNow:', err);
      toast({
        title: "Save Error",
        description: "An unexpected error occurred while saving.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [sessionId, userId, portfolioData.reflectionEssay, toast]);

  // Manual reload function
  const reloadFromDatabase = useCallback(async () => {
    if (!sessionId || !userId) return false;

    try {
      setLoading(true);

      const { data: dbData, error } = await supabase
        .from('internship_portfolio_data')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (dbData) {
        const reloadedData = {
          reflectionEssay: dbData.reflection_essay || ''
        };
        
        setPortfolioData(reloadedData);

        // Update localStorage with reloaded data
        const localStorageKey = `portfolio_${sessionId}_${userId}`;
        localStorage.setItem(localStorageKey, JSON.stringify(reloadedData));

        toast({
          title: "Reloaded Successfully",
          description: "Your reflection essay has been reloaded from the database.",
        });
        return true;
      } else {
        toast({
          title: "No Saved Data",
          description: "No saved reflection essay found in the database.",
          variant: "destructive"
        });
        return false;
      }
    } catch (err) {
      console.error('Error reloading portfolio data:', err);
      toast({
        title: "Reload Error",
        description: "Failed to reload your reflection essay.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [sessionId, userId, toast]);

  return {
    portfolioData,
    loading,
    saving,
    updatePortfolioData,
    saveNow,
    reloadFromDatabase
  };
}
