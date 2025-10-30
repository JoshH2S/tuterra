import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { NewWelcomeScreen } from '@/components/internship/NewWelcomeScreen';
import { CompanyProfileService } from '@/services/companyProfileService';
import { AISupervisorService } from '@/services/aiSupervisor';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

export default function WelcomePage() {
  const navigate = useNavigate();
  const params = useParams<{ sessionId?: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startingStep, setStartingStep] = useState('');
  
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
          industry: sessionData.industry,
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
    if (!sessionId || !user?.id) return;
    
    setIsStarting(true);
    
    try {
      // Step 1: Check company profile status
      setStartingStep('Checking your internship setup...');
      const status = await CompanyProfileService.checkProfileStatus(sessionId);
      
      if (status.isComplete) {
        // Already complete, just send message and go
        setStartingStep('Preparing your welcome message...');
        try {
          await AISupervisorService.triggerOnboarding(sessionId, user.id);
        } catch (error) {
          console.error('Error sending welcome message:', error);
        }
        
        setStartingStep('Taking you to your dashboard...');
        navigate(`/dashboard/virtual-internship?sessionId=${sessionId}`);
        return;
      }
      
      // Step 2: Generate company profile if needed
      if (!status.isGenerating) {
        setStartingStep('Creating your personalized company experience...');
        const generateResult = await CompanyProfileService.generateProfile(
          sessionId,
          sessionData.jobTitle,
          sessionData.industry || ''
        );
        
        if (!generateResult.success) {
          throw new Error(generateResult.error || 'Failed to start company profile generation');
        }
        
        // Give it a moment to start
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Step 3: Wait for company profile completion
      setStartingStep('Building your virtual workplace...');
      const completionStatus = await CompanyProfileService.waitForCompletion(sessionId, 120000);
      
      if (completionStatus.error) {
        throw new Error(completionStatus.error);
      }
      
      if (!completionStatus.isComplete) {
        throw new Error('Setup is taking longer than expected. Please try again.');
      }
      
      // Step 4: Send welcome message
      setStartingStep('Preparing your welcome message...');
      try {
        await AISupervisorService.triggerOnboarding(sessionId, user.id);
        toast({
          title: "Welcome message sent!",
          description: "Check your Messages tab to get started with your supervisor.",
          duration: 4000,
        });
      } catch (error) {
        console.error('Error sending welcome message:', error);
        // Don't block the flow if this fails - the message will be created via fallback
      }
      
      // Step 5: Success - redirect to dashboard
      setStartingStep('Taking you to your dashboard...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause for UX
      navigate(`/dashboard/virtual-internship?sessionId=${sessionId}`);
      
    } catch (error) {
      console.error('Error starting internship:', error);
      setError(error instanceof Error ? error.message : 'Failed to start internship. Please try again.');
      setIsStarting(false);
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
    <>
      <NewWelcomeScreen 
        sessionId={sessionId}
        internshipData={sessionData}
        onStart={handleStart}
        isStarting={isStarting}
      />
      
      {/* Loading Modal Overlay */}
      <AnimatePresence>
        {isStarting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl"
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <Sparkles className="h-6 w-6 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Finishing Up Some Final Touches
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {startingStep || 'Preparing your internship experience...'}
                  </p>
                </div>

                <div className="text-xs text-gray-500">
                  This may take up to 2 minutes
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 