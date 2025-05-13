
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const InternshipPhase2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  
  // Get session ID from URL query parameters
  const params = new URLSearchParams(location.search);
  const sessionId = params.get('sid');

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!user || !sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('internship_sessions')
          .select('job_title, industry, current_phase')
          .eq('session_id', sessionId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          toast({
            title: "Session not found",
            description: "We couldn't find your internship session.",
            variant: "destructive",
          });
          navigate('/interview-simulator');
          return;
        }

        if (data.current_phase < 2) {
          toast({
            title: "Phase not unlocked",
            description: "You need to complete Phase 1 first.",
            variant: "destructive",
          });
          navigate('/interview-simulator');
          return;
        }

        setSessionData(data);
      } catch (error) {
        console.error("Error fetching session data:", error);
        toast({
          title: "Error",
          description: "Failed to load internship data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [user, sessionId, navigate, toast]);

  const handleBackToHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Internship Phase 2: Onboarding</CardTitle>
          <CardDescription>
            {sessionData?.job_title ? `${sessionData.job_title} | ${sessionData.industry}` : "Virtual Internship Program"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">Welcome to Phase 2!</h3>
            <p>Congratulations on completing your interview successfully. In this phase, you'll learn more about the company and your role.</p>
            <p className="mt-2">This phase is under development and will be available soon.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleBackToHome} className="w-full">
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InternshipPhase2;
