
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const InternshipPage = () => {
  const { id } = useParams<{ id: string }>();
  const [internship, setInternship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access your internship.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    const fetchInternshipData = async () => {
      if (!id) return;

      try {
        // Fetch internship session data
        const { data: internshipData, error: internshipError } = await supabase
          .from("internship_sessions")
          .select("*")
          .eq("id", id)
          .single();

        if (internshipError || !internshipData) {
          throw new Error("Internship not found");
        }

        if (internshipData.user_id !== user.id) {
          throw new Error("You don't have access to this internship");
        }

        setInternship(internshipData);
        setCurrentPhase(internshipData.current_phase);

        // Fetch phase 1 feedback
        if (internshipData.current_phase >= 1) {
          const { data: progressData } = await supabase
            .from("internship_progress")
            .select("ai_feedback")
            .eq("phase_number", 1)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .maybeSingle();

          if (progressData?.ai_feedback) {
            setFeedback(progressData.ai_feedback);
          }
        }
      } catch (error: any) {
        console.error("Error fetching internship data:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load internship data",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchInternshipData();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl mx-auto px-4">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {internship?.job_title} Internship
          </h1>
          <p className="text-muted-foreground">
            Industry: {internship?.industry}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Phase {currentPhase}: Interview</CardTitle>
            <CardDescription>
              You've completed the interview phase of your virtual internship
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg p-6 bg-muted/30">
              <h3 className="text-xl font-semibold mb-4">Your Feedback</h3>
              <div className="whitespace-pre-line">
                {feedback || "No feedback available."}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Coming Soon</h3>
              <p className="text-yellow-700 text-sm">
                Phase 2 of your internship is under development and will be available soon.
                You'll receive guidance on onboarding and learning the essential skills for your role.
              </p>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => navigate("/interview")} 
                variant="outline"
              >
                Start Another Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InternshipPage;
