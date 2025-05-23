
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SwipeableInternshipView } from "@/components/internship/SwipeableInternshipView";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Briefcase, PlusCircle } from "lucide-react";

export default function VirtualInternshipDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasInternships, setHasInternships] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkForExistingInternships() {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error, count } = await supabase
          .from("internship_sessions")
          .select("id", { count: 'exact' })
          .eq("user_id", user.id)
          .limit(1);
          
        if (error) {
          throw error;
        }
        
        setHasInternships(count !== null && count > 0);
      } catch (error) {
        console.error("Error checking internships:", error);
        setHasInternships(false);
      } finally {
        setLoading(false);
      }
    }
    
    checkForExistingInternships();
  }, [user]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            className="gap-2"
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
      <SwipeableInternshipView />
    </div>
  );
}
