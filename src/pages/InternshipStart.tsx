
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select-simple";
import { toast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingStates";
import { industryOptions } from "@/data/industry-options";
import { useInternship } from "@/hooks/internship";

const InternshipStart = () => {
  const navigate = useNavigate();
  const { createInternshipSession, loading } = useInternship();
  const [formData, setFormData] = useState({
    jobTitle: "",
    industry: "",
    jobDescription: "",
  });
  const [submitting, setSubmitting] = useState(false);

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
    console.log("🔍 InternshipStart: Form submit handler triggered");
    
    // Prevent double submission
    if (submitting) {
      console.log("🚫 InternshipStart: Preventing double submission");
      return;
    }

    try {
      setSubmitting(true);
      console.log("📝 InternshipStart: Form data being submitted:", formData);
      
      // Use the createInternshipSession function from our context and properly handle the return value
      console.log("🔄 InternshipStart: Calling createInternshipSession function");
      const sessionId = await createInternshipSession(
        formData.jobTitle,
        formData.industry,
        formData.jobDescription
      );
      
      console.log("✅ InternshipStart: createInternshipSession returned", { sessionId });

      if (sessionId) {
        console.log("➡️ InternshipStart: Redirecting to interview invitation page", sessionId);
        // Redirect to the interview invitation page with session ID
        navigate(`/internship/interview/invite/${sessionId}`);
      } else {
        console.error("❌ InternshipStart: No sessionId returned but no error thrown");
        toast({
          title: "Error",
          description: "Failed to create internship session. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ InternshipStart: Error in submit handler:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
              disabled={loading || submitting}
            >
              {loading || submitting ? (
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
