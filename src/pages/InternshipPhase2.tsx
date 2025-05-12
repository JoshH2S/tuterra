
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const InternshipPhase2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  
  // Extract session ID from URL query params
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session');
  
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!user || !sessionId) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('internship_sessions')
          .select('*, internship_progress(*)')
          .eq('session_id', sessionId)
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        
        setSessionData(data);
      } catch (error) {
        console.error("Error fetching internship data:", error);
        toast({
          title: "Error",
          description: "Could not load your internship data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionData();
  }, [sessionId, user]);
  
  const goBack = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container py-8">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Sign In Required</h2>
          <p className="mb-6">Please sign in to view your internship progress.</p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </Card>
      </div>
    );
  }
  
  if (!sessionData) {
    return (
      <div className="container py-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Internship Not Found</h2>
          <p className="mb-6">
            We couldn't find the internship session you're looking for. Please start a new interview to begin your virtual internship.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={() => navigate("/interview-simulator")}>
              Start New Interview
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={goBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-2">Phase 2: Onboarding</h1>
        <h2 className="text-xl text-muted-foreground mb-6">
          {sessionData.job_title} ({sessionData.industry})
        </h2>
        
        <div className="space-y-6">
          <p className="leading-relaxed">
            Welcome to Phase 2 of your virtual internship! This phase involves getting oriented with 
            your new role as a {sessionData.job_title} and understanding the company culture.
          </p>
          
          <div className="p-4 bg-muted rounded-md">
            <h3 className="font-medium mb-2">Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              This phase is currently under development. Check back soon for your onboarding activities!
            </p>
          </div>
          
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Your Interview Feedback</h3>
            {sessionData.internship_progress?.[0]?.ai_feedback ? (
              <div className="whitespace-pre-line">
                {sessionData.internship_progress[0].ai_feedback}
              </div>
            ) : (
              <p className="text-muted-foreground">No feedback available</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InternshipPhase2;
