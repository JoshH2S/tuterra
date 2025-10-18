import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { debounce } from '@/utils/debounce';

export interface CompanyApplication {
  id: string;
  companyName: string;
  position: string;
  companyUrl: string;
  researchNotes: string;
  coverLetter: string;
  completed: boolean;
  applicationSent?: boolean;
}

export function useCompanyApplications(sessionId: string, userId: string) {
  const [companies, setCompanies] = useState<CompanyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load companies from database and localStorage
  useEffect(() => {
    const loadCompanies = async () => {
      if (!sessionId || !userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // First try to load from database
        const { data: dbCompanies, error } = await supabase
          .from('internship_company_applications')
          .select('*')
          .eq('session_id', sessionId)
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading companies from database:', error);
          // Fall back to localStorage
          const localKey = `company_applications_${sessionId}_${userId}`;
          const localData = localStorage.getItem(localKey);
          if (localData) {
            const parsedData = JSON.parse(localData);
            setCompanies(parsedData);
          } else {
            // Initialize with empty slots
            initializeEmptyCompanies();
          }
        } else if (dbCompanies && dbCompanies.length > 0) {
          // Transform database format to component format
          const transformedCompanies = dbCompanies.map(dbCompany => ({
            id: dbCompany.id,
            companyName: dbCompany.company_name,
            position: dbCompany.position,
            companyUrl: dbCompany.company_url || '',
            researchNotes: dbCompany.research_notes || '',
            coverLetter: dbCompany.cover_letter || '',
            completed: dbCompany.completed || false,
            applicationSent: (dbCompany as any).application_sent || false
          }));
          
          // Ensure we always have exactly 5 companies
          const finalCompanies = [...transformedCompanies];
          while (finalCompanies.length < 5) {
            finalCompanies.push({
              id: `company-${finalCompanies.length + 1}`,
              companyName: '',
              position: '',
              companyUrl: '',
              researchNotes: '',
              coverLetter: '',
              completed: false,
              applicationSent: false
            });
          }
          
          setCompanies(finalCompanies);
          
          // Also save to localStorage as backup
          const localKey = `company_applications_${sessionId}_${userId}`;
          localStorage.setItem(localKey, JSON.stringify(finalCompanies));
        } else {
          // No data in database, check localStorage
          const localKey = `company_applications_${sessionId}_${userId}`;
          const localData = localStorage.getItem(localKey);
          if (localData) {
            const parsedData = JSON.parse(localData);
            setCompanies(parsedData);
          } else {
            // Initialize with empty slots
            initializeEmptyCompanies();
          }
        }
      } catch (err) {
        console.error('Error in loadCompanies:', err);
        initializeEmptyCompanies();
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, [sessionId, userId]);

  const initializeEmptyCompanies = () => {
    const initialCompanies: CompanyApplication[] = Array.from({ length: 5 }, (_, i) => ({
      id: `company-${i + 1}`,
      companyName: '',
      position: '',
      companyUrl: '',
      researchNotes: '',
      coverLetter: '',
      completed: false,
      applicationSent: false
    }));
    setCompanies(initialCompanies);
  };


  // Update a specific company (local state only, no auto-save)
  const updateCompany = useCallback((id: string, field: keyof CompanyApplication, value: string | boolean) => {
    setCompanies(prev => {
      const updated = prev.map(company => 
        company.id === id ? { ...company, [field]: value } : company
      );
      
      // Save to localStorage immediately for backup
      const localStorageKey = `companies_${sessionId}_${userId}`;
      localStorage.setItem(localStorageKey, JSON.stringify(updated));
      
      return updated;
    });
  }, [sessionId, userId]);

  // Manual save function for a specific company
  const saveCompany = useCallback(async (companyId: string, overrideData?: Partial<CompanyApplication>) => {
    console.log('saveCompany called with:', companyId, 'override:', overrideData);
    const company = companies.find(c => c.id === companyId);
    console.log('Found company:', company);
    
    // Apply any override data (for immediate state changes)
    const companyToSave = overrideData ? { ...company, ...overrideData } : company;
    if (!company || !sessionId || !userId) {
      console.log('Missing data - company:', !!company, 'sessionId:', !!sessionId, 'userId:', !!userId);
      return false;
    }

    try {
      setSaving(true);

      // Save if company has content OR if we're tracking application_sent status (even when false)
      const hasContent = companyToSave.companyName.trim() || 
                        companyToSave.position.trim() || 
                        companyToSave.coverLetter.trim() || 
                        companyToSave.researchNotes.trim();
      
      const hasApplicationSentData = companyToSave.applicationSent !== undefined;
      
      if (hasContent || hasApplicationSentData) {
        
        // Include the id if this is an existing record (UUID from database)
        // This ensures we update the correct record instead of creating duplicates
        const isExistingRecord = companyToSave.id && companyToSave.id.length > 10; // UUIDs are longer than our local IDs
        
        const dataToSave: any = {
          session_id: sessionId,
          user_id: userId,
          company_name: companyToSave.companyName || `Company ${companyToSave.id}`, // Ensure non-empty name
          position: companyToSave.position,
          company_url: companyToSave.companyUrl,
          research_notes: companyToSave.researchNotes,
          cover_letter: companyToSave.coverLetter,
          completed: companyToSave.completed,
          application_sent: companyToSave.applicationSent || false
        };
        
        // Include ID for existing records to ensure proper updates
        if (isExistingRecord) {
          dataToSave.id = companyToSave.id;
        }
        
        console.log('Saving company data:', dataToSave);

        const { error } = await supabase
          .from('internship_company_applications')
          .upsert(dataToSave, {
            onConflict: isExistingRecord ? 'id' : 'session_id,user_id,company_name'
          });

        if (error) {
          console.error('Error saving company:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          toast({
            title: "Save Failed",
            description: "Failed to save company data. Please try again.",
            variant: "destructive"
          });
          return false;
        }
        
        console.log('Company saved successfully');

        toast({
          title: "Saved Successfully",
          description: `${company.companyName || 'Company'} data has been saved.`,
        });
        return true;
      }
      return true; // No content to save, but not an error
    } catch (err) {
      console.error('Error in saveCompany:', err);
      toast({
        title: "Save Error",
        description: "An unexpected error occurred while saving.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [companies, sessionId, userId, toast]);

  return {
    companies,
    loading,
    saving,
    updateCompany,
    saveCompany
  };
}
