import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Download, ArrowLeft, CheckCircle, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { useInternshipCompletion } from "@/hooks/useInternshipCompletion";
import { CertificateService } from "@/services/certificateService";

interface CompletionData {
  sessionId: string;
  jobTitle: string;
  industry: string;
  submittedAt: string;
  reflection: string;
}

export default function InternshipCompletionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  
  // Use the comprehensive completion hook for certificate data
  const { completionData: fullCompletionData, fetchCompletionData: fetchFullCompletionData } = useInternshipCompletion(
    sessionId || '', 
    user?.id || ''
  );

  useEffect(() => {
    // Redirect if no sessionId
    if (!sessionId) {
      navigate("/dashboard/virtual-internship");
      return;
    }

    const fetchCompletionData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get internship session data
        const { data: sessionData, error: sessionError } = await supabase
          .from("internship_sessions")
          .select("id, job_title, industry, is_completed")
          .eq("id", sessionId)
          .eq("user_id", user.id)
          .single();
        
        if (sessionError || !sessionData) {
          throw new Error("Internship session not found");
        }
        
        // Check if internship is actually completed
        if (!(sessionData as any).is_completed) {
          navigate(`/dashboard/virtual-internship`);
          return;
        }
        
        // Get final submission data
        const { data: submissionData, error: submissionError } = await supabase
          .from("internship_final_submissions" as any)
          .select("submitted_at, reflection")
          .eq("session_id", sessionId)
          .eq("user_id", user.id)
          .single();
        
        if (submissionError) {
          throw submissionError;
        }
        
        setCompletionData({
          sessionId: (sessionData as any).id,
          jobTitle: (sessionData as any).job_title,
          industry: (sessionData as any).industry,
          submittedAt: (submissionData as any).submitted_at,
          reflection: (submissionData as any).reflection
        });
        
        // Add a milestone event for internship completion if not already added
        const { data: existingEvent } = await supabase
          .from("internship_events")
          .select("id")
          .eq("session_id", sessionId)
          .eq("type", "milestone")
          .ilike("title", "%Completed%")
          .single();
          
        if (!existingEvent) {
          // Add completion milestone to the calendar
          await supabase
            .from("internship_events")
            .insert({
              session_id: sessionId,
              title: "Internship Successfully Completed",
              type: "milestone",
              date: (submissionData as any).submitted_at,
            });
        }
        
      } catch (error) {
        console.error("Error fetching completion data:", error);
        toast({
          title: "Error loading completion data",
          description: "There was an issue loading your internship completion data.",
          variant: "destructive"
        });
        navigate("/dashboard/virtual-internship");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletionData();
    
    // Also fetch comprehensive completion data for certificate
    if (sessionId && user?.id) {
      fetchFullCompletionData();
    }
  }, [sessionId, user, navigate, toast, fetchFullCompletionData]);

  const handleViewCertificate = async () => {
    if (!user || !completionData || !sessionId) {
      toast({
        title: "Unable to generate certificate",
        description: "Please ensure you're logged in and the internship is completed.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate certificate and get URL
      const certificateUrl = await CertificateService.generateAndGetUrl(sessionId, user.id);
      
      // Navigate to certificate page
      window.open(certificateUrl, '_blank');

      toast({
        title: "Certificate Generated!",
        description: "Your digital certificate has been created and opened in a new tab.",
      });

    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Error generating certificate",
        description: "There was an issue creating your certificate. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-8 px-4 min-h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!completionData) {
    return null; // Will navigate away in useEffect
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="flex items-center mb-4" 
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="flex flex-col items-center text-center mb-12">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Trophy className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Congratulations!</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          You've successfully completed your virtual internship as a 
          <span className="font-medium text-foreground"> {completionData.jobTitle} </span> 
          in the {completionData.industry} industry.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Achievements
            </CardTitle>
            <CardDescription>
              What you've accomplished during your internship
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-md">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Completed all assigned tasks</p>
                <p className="text-sm text-muted-foreground">
                  You've demonstrated responsibility and time management
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-md">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Submitted final project</p>
                <p className="text-sm text-muted-foreground">
                  You've showcased your skills and knowledge
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-md">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Completed self-reflection</p>
                <p className="text-sm text-muted-foreground">
                  You've demonstrated critical thinking and self-awareness
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Skills Developed</CardTitle>
            <CardDescription>
              Key skills you've developed during this internship
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {generateSkillsFromJobTitle(completionData.jobTitle).map((skill, index) => (
                <div 
                  key={index} 
                  className="px-3 py-1.5 bg-primary/10 text-primary-foreground rounded-full text-sm"
                >
                  {skill}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Your Reflection</CardTitle>
          <CardDescription>
            Your thoughts on the internship experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-line">{completionData.reflection}</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col items-center mb-12">
        <Button 
          className="flex items-center gap-2" 
          size="lg"
          onClick={handleViewCertificate}
        >
          <CheckCircle className="w-4 h-4" />
          View Digital Certificate
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          View and download your professional completion certificate
        </p>
      </div>
      
      <div className="text-center">
        <h2 className="text-xl font-medium mb-4">What's Next?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Start Another Internship</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Explore different roles and industries
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate("/dashboard/virtual-internship/new")}
              >
                New Internship
              </Button>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Update Your Portfolio</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add this experience to your resume
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate("/dashboard/profile")}
              >
                Go to Profile
              </Button>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Return to Dashboard</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Explore other learning opportunities
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card className="text-center bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30 mt-6">
        <CardContent className="pt-6">
          <div className="flex justify-center mb-3">
            <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-medium mb-2">Achievement Recorded</h3>
          <p className="text-sm text-muted-foreground mb-1">
            This achievement has been added to your internship calendar
          </p>
          <p className="text-xs text-muted-foreground">
            Completed on {format(new Date(completionData.submittedAt), "MMMM d, yyyy")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to generate skills based on job title
function generateSkillsFromJobTitle(jobTitle: string): string[] {
  const commonSkills = [
    "Communication",
    "Time Management",
    "Problem Solving",
    "Teamwork",
    "Critical Thinking"
  ];
  
  const jobSpecificSkills: Record<string, string[]> = {
    "software engineer": ["JavaScript", "React", "API Integration", "Git", "Code Review"],
    "data analyst": ["Data Visualization", "SQL", "Python", "Data Cleaning", "Statistical Analysis"],
    "marketing": ["Social Media", "Content Creation", "SEO", "Analytics", "Campaign Planning"],
    "product manager": ["User Research", "Roadmapping", "Agile", "Feature Prioritization", "Stakeholder Management"],
    "ux designer": ["User Research", "Wireframing", "Prototyping", "Usability Testing", "UI Design"],
    "graphic designer": ["Adobe Creative Suite", "Typography", "Visual Design", "Branding", "Illustration"],
    "content writer": ["SEO Writing", "Copywriting", "Content Strategy", "Research", "Editing"],
  };
  
  // Try to find specific skills based on job title
  const lowerJobTitle = jobTitle.toLowerCase();
  let specificSkills: string[] = [];
  
  for (const [key, skills] of Object.entries(jobSpecificSkills)) {
    if (lowerJobTitle.includes(key)) {
      specificSkills = skills;
      break;
    }
  }
  
  // If no specific skills found, use a subset of common skills
  if (specificSkills.length === 0) {
    return commonSkills;
  }
  
  // Combine some common skills with specific skills
  return [...specificSkills, ...commonSkills.slice(0, 2)];
} 