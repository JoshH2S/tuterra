
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VerificationSuccessProps {
  onContinue: () => void;
}

export const VerificationSuccess = ({ onContinue }: VerificationSuccessProps) => {
  useEffect(() => {
    const sendWelcomeEmail = async () => {
      try {
        const { data: { user, session } } = await supabase.auth.getSession();
        
        if (!user || !session?.access_token) {
          console.error("[WelcomeEmail] No valid session for email sending");
          return;
        }

        const { data, error } = await supabase.functions.invoke("send-welcome-email", {
          body: {
            email: user.email,
            firstName: user.user_metadata?.first_name || 
                      user.user_metadata?.firstName || 
                      user.email.split('@')[0]
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (error) throw error;

        if (data?.status === 'success') {
          await supabase
            .from('profiles')
            .update({ welcome_email_sent: true })
            .eq('id', user.id);

          console.log("[WelcomeEmail] Successfully sent for user:", user.id);
        }
      } catch (error: any) {
        console.error("[WelcomeEmail] Error sending welcome email:", error);
      }
    };

    sendWelcomeEmail();
  }, []);

  return (
    <div className="space-y-6 text-center">
      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      
      <h2 className="text-xl font-semibold text-gray-800">Email Verified!</h2>
      
      <p className="text-gray-600">
        Your email has been successfully verified. You can now continue to set up your profile.
      </p>
      
      <Button
        size="lg"
        className="px-8 w-full md:w-auto"
        onClick={onContinue}
      >
        Continue to Tuterra!
      </Button>
    </div>
  );
};
