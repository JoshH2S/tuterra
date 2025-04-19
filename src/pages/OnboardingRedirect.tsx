
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const OnboardingRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [redirecting, setRedirecting] = useState(true);
  
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        setRedirecting(true);
        const searchParams = new URLSearchParams(location.search);
        const sessionId = searchParams.get('session_id');
        
        if (sessionId) {
          // Stripe checkout was successful - wait briefly to let webhook process if needed
          toast({
            title: "Success!",
            description: "Your pro subscription is now active.",
          });
          
          // Short delay to allow webhook to process subscription
          setTimeout(() => {
            navigate('/onboarding', { replace: true });
          }, 1500);
        } else {
          // Direct access or after free plan selection - navigate to onboarding immediately
          navigate('/onboarding', { replace: true });
        }
      } catch (error) {
        console.error('Redirect error:', error);
        // Even on error, we redirect to onboarding to prevent users getting stuck
        navigate('/onboarding', { replace: true });
      } finally {
        setRedirecting(false);
      }
    };
    
    handleRedirect();
  }, [location, navigate, toast]);

  if (redirecting) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <Card className="p-8 shadow-lg">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Setting up your account</h2>
            <p className="text-muted-foreground">Just a moment while we prepare your dashboard...</p>
          </Card>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default OnboardingRedirect;
