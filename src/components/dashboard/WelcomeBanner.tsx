
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumContentCard } from '@/components/ui/premium-card';

interface WelcomeBannerProps {
  userName: string;
}

export const WelcomeBanner = ({ userName }: WelcomeBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  
  useEffect(() => {
    // Check if the user is new by seeing if they've dismissed this banner before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsNewUser(true);
      // After 2 days, we'll consider the user not new anymore
      localStorage.setItem('hasSeenWelcome', Date.now().toString());
    }
  }, []);
  
  const handleDismiss = () => {
    setIsVisible(false);
  };
  
  if (!isVisible) return null;
  
  const welcomeTitle = isNewUser ? 'Welcome to EduPortal' : 'Welcome back';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mb-6"
    >
      <PremiumContentCard
        variant={subscription.tier === 'free' ? 'minimal' : 'glass'}
        className="relative overflow-hidden"
        title={`${welcomeTitle}, ${userName}!`}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2">
          <div>
            {subscription.tier !== 'free' && (
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
            )}
            
            {subscription.tier === 'free' ? (
              <p className="text-muted-foreground mt-1">
                You're currently on the Free plan. Upgrade to unlock advanced features and unlimited access.
              </p>
            ) : (
              <p className="text-muted-foreground mt-1">
                You have full access to all {subscription.tier === 'premium' ? 'Premium' : 'Pro'} features. Enjoy your learning journey!
              </p>
            )}
          </div>
          
          {subscription.tier === 'free' && (
            <Button
              onClick={() => navigate('/pricing')}
              className="whitespace-nowrap"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade Now
            </Button>
          )}
        </div>
      </PremiumContentCard>
    </motion.div>
  );
};
