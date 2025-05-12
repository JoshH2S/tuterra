
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const InternshipPhaseTwo = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No session ID provided. Please restart your internship."
        });
        navigate('/interview');
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("internship_sessions")
          .select("job_title, industry, current_phase")
          .eq("id", sessionId)
          .single();

        if (error) throw error;

        if (!data) {
          toast({
            variant: "destructive",
            title: "Session Not Found",
            description: "Could not find your internship session. Please start a new one."
          });
          navigate('/interview');
          return;
        }

        // Verify user is allowed to be in phase 2
        if (data.current_phase < 2) {
          toast({
            variant: "warning",
            title: "Phase Not Available",
            description: "You need to complete Phase 1 first."
          });
          navigate(`/interview/${sessionId}`);
          return;
        }

        setSessionData(data);
      } catch (error) {
        console.error("Error fetching session data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load your internship data. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId, navigate, toast]);

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-medium">Loading your internship...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Phase 2: Onboarding
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Welcome to your virtual internship at {sessionData?.job_title}
        </p>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Internship Details</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Position</p>
            <p className="text-lg">{sessionData?.job_title}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Industry</p>
            <p className="text-lg">{sessionData?.industry}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current Phase</p>
            <p className="text-lg">Phase 2: Onboarding</p>
          </div>
        </div>
      </Card>

      <div className="bg-muted p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">What to Expect</h2>
        <p className="mb-4">
          Now that you've successfully passed your interview, you're beginning your virtual internship experience! 
          In this phase, you'll learn about the company, your role, and get set up with your first project.
        </p>
        <p>
          Phase 2 is currently under development. More features will be available soon!
        </p>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate(`/interview/${sessionId}`)}>
          Back to Phase 1
        </Button>
        <Button onClick={() => navigate('/interview')}>
          Start a New Internship
        </Button>
      </div>
    </div>
  );
};

export default InternshipPhaseTwo;
