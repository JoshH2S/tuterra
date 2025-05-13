
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select-simple";
import { toast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingStates";
import { industryOptions } from "@/data/industry-options";

const InternshipStart = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    jobTitle: "",
    industry: "",
    jobDescription: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to start the internship process.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Insert new internship session
      const { data: sessionData, error: insertError } = await supabase
        .from("internship_sessions")
        .insert({
          user_id: user.id,
          job_title: formData.jobTitle,
          industry: formData.industry,
          job_description: formData.jobDescription,
          created_at: new Date().toISOString(),
          current_phase: 1,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Error creating internship session:", insertError);
        toast({
          title: "Error",
          description: "Failed to create internship session. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Success",
        description: "Your virtual internship session has been created!",
      });

      // Redirect to interview page with session ID
      navigate(`/interview/${sessionData.id}`);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-8 max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Start Your Virtual Internship</h1>
        <p className="text-muted-foreground">
          Complete the form below to begin your personalized virtual internship experience.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
          <CardDescription>
            Enter details about the job you're interested in to tailor your internship experience.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                placeholder="e.g. Software Developer, Marketing Specialist"
                value={formData.jobTitle}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                options={industryOptions}
                placeholder="Select industry"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                name="jobDescription"
                placeholder="Enter the job description or key responsibilities..."
                value={formData.jobDescription}
                onChange={handleChange}
                rows={6}
                required
                className="w-full"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="small" />
                  <span>Creating Your Internship...</span>
                </div>
              ) : (
                "Start Internship"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default InternshipStart;
