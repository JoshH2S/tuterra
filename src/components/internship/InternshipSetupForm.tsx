
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
    
    try {
      // Insert new internship session into Supabase
      const { data: session, error } = await supabase
        .from("internship_sessions")
        .insert({
          user_id: user.id,
          job_title: data.jobTitle,
          industry: data.industry,
          job_description: data.jobDescription,
          duration_weeks: data.durationWeeks,
          start_date: data.startDate,
          current_phase: 1,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Internship Created!",
        description: "Your virtual internship has been set up successfully.",
      });
      
      // Navigate to the internship dashboard
      navigate("/dashboard/virtual-internship", { 
        state: { newInternship: true, internshipId: session.id } 
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
    }
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
    <Card className="w-full max-w-2xl mx-auto">
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
                      className="h-12 text-base md:text-sm" 
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
                      <SelectTrigger className="h-12 text-base md:text-sm">
                        <SelectValue placeholder="Select an industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
                      className="text-base md:text-sm"
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
                        className="h-12 text-base md:text-sm"
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
                        className="h-12 text-base md:text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full md:w-auto"
        >
          {isSubmitting ? "Creating..." : "Create Internship"}
        </Button>
      </CardFooter>
    </Card>
  );
}
