
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const OnboardingRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(location.search);
  
  useEffect(() => {
    const handleRedirect = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (sessionId) {
        // Stripe checkout was successful
        toast({
          title: "Success!",
          description: "Your pro subscription is now active.",
        });
        navigate('/onboarding', { replace: true });
      } else {
        // Direct access or after free plan selection
        navigate('/onboarding', { replace: true });
      }
    };
    
    handleRedirect();
  }, [location]);

  return null;
};

export default OnboardingRedirect;
