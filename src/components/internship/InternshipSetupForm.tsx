
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const formSchema = z.object({
  jobTitle: z.string().min(2, "Job title must be at least 2 characters"),
  industry: z.string().min(2, "Please select an industry"),
  jobDescription: z.string().min(20, "Please provide a detailed job description"),
  durationWeeks: z.coerce.number().int().min(1).max(52),
  startDate: z.string()
});

type FormValues = z.infer<typeof formSchema>;

export function InternshipSetupForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Set default date to today in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: "",
      industry: "",
      jobDescription: "",
      durationWeeks: 6,
      startDate: today
    }
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create an internship",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setGenerationProgress(10); // Start progress indication
    
    try {
      // Show initial toast
      toast({
        title: "Creating your internship...",
        description: "Setting up your virtual internship experience. This might take a minute.",
      });
      
      setGenerationProgress(30);

      // Get the session JWT for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session found");
      }

      // Use the edge function to create the internship
      const response = await fetch(`https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/create-internship-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          job_title: data.jobTitle,
          industry: data.industry,
          job_description: data.jobDescription,
          duration_weeks: data.durationWeeks,
          start_date: data.startDate
        })
      });

      setGenerationProgress(70);

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || result.details || "Failed to create internship");
      }

      setGenerationProgress(100);
      
      toast({
        title: "Internship Created!",
        description: "Your virtual internship has been set up successfully.",
      });
      
      // Add haptic feedback for mobile devices if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
      
      // Navigate to the internship dashboard
      navigate("/dashboard/virtual-internship", { 
        state: { newInternship: true, internshipId: result.sessionId } 
      });
    } catch (error: any) {
      console.error("Error creating internship:", error);
      toast({
        title: "Failed to create internship",
        description: error.message || "There was an error setting up your internship.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setGenerationProgress(0);
    }
  };

  // Touch gesture handlers for form scrolling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartY) return;
    const touchY = e.touches[0].clientY;
    const diff = touchStartY - touchY;
    
    // If user is scrolling down on the form, prevent default to allow smooth scrolling
    if (Math.abs(diff) > 10) {
      // Allow natural scrolling behavior
    }
  };

  const handleTouchEnd = () => {
    setTouchStartY(null);
  };

  const industries = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Retail",
    "Manufacturing",
    "Marketing",
    "Legal",
    "Hospitality",
    "Construction",
    "Media",
    "Government",
    "Non-profit",
    "Other"
  ];

  return (
    <Card 
      className="w-full max-w-2xl mx-auto shadow-md"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl font-bold">Create Virtual Internship</CardTitle>
        </div>
        <CardDescription>
          Set up a new virtual internship experience based on your career goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Frontend Developer" 
                      {...field} 
                      className="h-14 text-base md:h-12 md:text-sm"
                      autoComplete="off" 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the role you're interested in pursuing
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 text-base md:h-12 md:text-sm">
                        <SelectValue placeholder="Select an industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the industry most relevant to your target role
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter job description or responsibilities you'd like to focus on..." 
                      {...field} 
                      rows={5}
                      className="text-base md:text-sm min-h-[120px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Add details about the job responsibilities, skills, and expectations
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="durationWeeks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (weeks)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={52} 
                        {...field} 
                        className="h-14 text-base md:h-12 md:text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        className="h-14 text-base md:h-12 md:text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {generationProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-3 mt-6">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${generationProgress}%` }}
                ></div>
                <p className="text-sm text-center text-muted-foreground mt-2">
                  {generationProgress < 30 && "Preparing your internship..."}
                  {generationProgress >= 30 && generationProgress < 70 && "Generating personalized internship content..."}
                  {generationProgress >= 70 && "Finalizing your virtual workplace..."}
                </p>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto order-2 sm:order-1 touch-manipulation"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full sm:w-auto flex items-center gap-2 order-1 sm:order-2 h-14 sm:h-10 touch-manipulation"
        >
          {isSubmitting ? (
            <>
              <span className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              Creating...
            </>
          ) : (
            <>
              <Briefcase className="h-5 w-5" />
              Create Internship
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
