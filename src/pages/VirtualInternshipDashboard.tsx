
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SwipeableInternshipView } from "@/components/internship/SwipeableInternshipView";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Briefcase, PlusCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

// Update the interface to match what comes from the database
export interface InternshipSession {
  id: string;
  user_id: string;
  job_title: string;
  industry: string;
  job_description: string;
  duration_weeks?: number; // Make optional since it might not be in the database response
  start_date?: string; // Make optional since it might not be in the database response
  current_phase: number;
  created_at: string;
  questions?: any;
}

export default function VirtualInternshipDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const [hasInternships, setHasInternships] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [internshipSession, setInternshipSession] = useState<InternshipSession | null>(null);

  useEffect(() => {
    // Show a welcome toast if redirected from internship creation
    if (location.state?.newInternship) {
      toast({
        title: "Internship Created Successfully",
        description: "Your virtual internship experience has been set up and is ready to explore.",
      });
    }
  }, [location.state, toast]);

  useEffect(() => {
    async function fetchInternshipData() {
      if (!user) return;
      
      setLoading(true);
      try {
        // If a specific sessionId is provided, fetch that session
        if (sessionId) {
          const { data: sessionData, error: sessionError } = await supabase
            .from("internship_sessions")
            .select("*")
            .eq("id", sessionId)
            .eq("user_id", user.id)
            .single();
          
          if (sessionError) {
            console.error("Error fetching internship session:", sessionError);
            throw sessionError;
          }
          
          if (sessionData) {
            // Ensure all required properties are present in the session data
            const completeSessionData: InternshipSession = {
              ...sessionData as InternshipSession, // Cast to InternshipSession to avoid type errors
              duration_weeks: (sessionData as any).duration_weeks || 4, // Default to 4 weeks if missing
              start_date: (sessionData as any).start_date || sessionData.created_at // Use created_at as fallback for start_date
            };
            
            setInternshipSession(completeSessionData);
            setHasInternships(true);
          } else {
            setHasInternships(false);
          }
        } else {
          // Otherwise, check if the user has any internships
          const { data, error, count } = await supabase
            .from("internship_sessions")
            .select("*", { count: 'exact' })
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);
            
          if (error) {
            console.error("Error checking internships:", error);
            throw error;
          }
          
          if (count && count > 0 && data && data.length > 0) {
            // Ensure all required properties are present in the session data
            const completeSessionData: InternshipSession = {
              ...data[0] as InternshipSession, // Cast to InternshipSession to avoid type errors
              duration_weeks: (data[0] as any).duration_weeks || 4, // Default to 4 weeks if missing
              start_date: (data[0] as any).start_date || data[0].created_at // Use created_at as fallback for start_date
            };
            
            setInternshipSession(completeSessionData);
            setHasInternships(true);
          } else {
            setHasInternships(false);
          }
        }
      } catch (error) {
        console.error("Error fetching internship data:", error);
        setHasInternships(false);
        toast({
          title: "Error Loading Internship",
          description: "We couldn't retrieve your internship data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchInternshipData();
  }, [user, sessionId, toast]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="large" />
          <p className="text-muted-foreground">Loading your internship experience...</p>
        </div>
      </div>
    );
  }
  
  if (hasInternships === false) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg">
          <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Virtual Internship Found</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Get hands-on experience by creating a virtual internship tailored to your career goals
          </p>
          <Button 
            onClick={() => navigate("/dashboard/internship/create")} 
            className="gap-2 touch-manipulation"
          >
            <PlusCircle className="h-5 w-5" />
            Create Virtual Internship
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <SwipeableInternshipView sessionData={internshipSession!} />
    </div>
  );
}
