
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserCredits } from '@/hooks/useUserCredits';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchUserCredits } = useUserCredits();
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<string>('');

  useEffect(() => {
    const getSubscriptionDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch user's subscription details
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth?next=/subscription-success');
          return;
        }
        
        // Fetch profile to get subscription tier
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setTier(profile.subscription_tier);
        }
        
        // Refresh user credits
        await fetchUserCredits();
        
        // Show success message
        toast({
          title: "Subscription activated",
          description: "Your account has been upgraded successfully.",
          variant: "default",
        });
      } catch (error) {
        console.error('Error fetching subscription details:', error);
        toast({
          title: "Something went wrong",
          description: "We couldn't verify your subscription status.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getSubscriptionDetails();
  }, [navigate, toast, fetchUserCredits]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Verifying your subscription</h2>
          <p className="text-muted-foreground">Just a moment while we set up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card border rounded-lg shadow-lg p-8"
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="rounded-full bg-green-100 p-3 mb-6"
          >
            <CheckCircle className="h-12 w-12 text-green-600" />
          </motion.div>
          
          <h1 className="text-2xl font-bold mb-2">Subscription Active!</h1>
          
          <p className="text-muted-foreground mb-6">
            {tier === 'pro' ? (
              "You now have access to Pro features. Your account has been upgraded successfully."
            ) : tier === 'premium' ? (
              "You now have access to all Premium features. Enjoy the full experience!"
            ) : (
              "Your subscription has been activated successfully."
            )}
          </p>
          
          <div className="bg-muted p-4 rounded-md w-full mb-6">
            <h3 className="font-medium mb-2">What's next?</h3>
            <ul className="text-sm text-left space-y-2">
              <li className="flex items-start">
                <div className="h-5 w-5 text-primary mr-2">•</div>
                <span>Explore your new features and premium content</span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 text-primary mr-2">•</div>
                <span>Complete your profile to get personalized suggestions</span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 text-primary mr-2">•</div>
                <span>Check out the expanded question database</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate('/profile-settings')}
            >
              Profile Settings
            </Button>
            <Button 
              className="flex-1 gap-1"
              onClick={() => navigate('/')}
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionSuccess;
