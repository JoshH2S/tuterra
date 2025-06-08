import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { NewWelcomeScreen } from '@/components/internship/NewWelcomeScreen';
import { CompanyProfileService } from '@/services/companyProfileService';
import { supabase } from '@/integrations/supabase/client';

export default function WelcomePage() {
  const navigate = useNavigate();
  const params = useParams<{ sessionId?: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get the session ID from the URL params or from local storage
  const getSessionId = () => {
    if (params?.sessionId) return params.sessionId;
    
    // Try to get from localStorage as fallback
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currentInternshipSession');
    }
    return null;
  };
  
  const sessionId = getSessionId();

  useEffect(() => {
    async function fetchSessionData() {
      if (!user || !sessionId) {
        setLoading(false);
        setError('Session information not found');
        return;
      }

      try {
        // Fetch session data
        const { data: sessionData, error: sessionError } = await supabase
          .from('internship_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .single();
          
        if (sessionError) {
          console.error('Error fetching session:', sessionError);
          throw new Error('Failed to load internship data');
        }
        
        if (!sessionData) {
          throw new Error('Internship session not found');
        }
        
        // Get company name
        const { data: companyData } = await supabase
          .from('internship_company_profiles')
          .select('company_name')
          .eq('session_id', sessionId)
          .single();
          
        const companyName = companyData?.company_name || 'Your Company';
        
        setSessionData({
          jobTitle: sessionData.job_title,
          companyName: companyName,
          startDate: sessionData.start_date || sessionData.created_at,
        });
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchSessionData();
  }, [user, sessionId]);

  const handleStart = async () => {
    if (!sessionId) return;
    
    try {
      // Check if company profile needs generation
      const status = await CompanyProfileService.checkProfileStatus(sessionId);
      
      if (!status.isComplete && !status.isGenerating) {
        // Start company profile generation
        await CompanyProfileService.generateProfile(
          sessionId,
          sessionData.jobTitle,
          sessionData?.industry || ''
        );
      }
      
      // Redirect to the dashboard
      navigate(`/dashboard/virtual-internship?session=${sessionId}`);
    } catch (error) {
      console.error('Error starting internship:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center flex-col p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
        <p className="text-gray-700 mb-4">{error || 'Failed to load internship data'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <NewWelcomeScreen 
      sessionId={sessionId}
      internshipData={sessionData}
      onStart={handleStart}
    />
  );
} 