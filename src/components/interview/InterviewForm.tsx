
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { SelectInput } from "@/components/interview/SelectInput";
import { INDUSTRY_OPTIONS } from "@/components/interview/constants";

interface InterviewFormProps {
  onSubmit: (industry: string, jobRole: string, jobDescription: string) => void;
  isLoading?: boolean;
}

export const InterviewForm = ({ onSubmit, isLoading = false }: InterviewFormProps) => {
  const [industry, setIndustry] = useState<string>("");
  const [jobRole, setJobRole] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{
    industry?: string;
    jobRole?: string;
    jobDescription?: string;
  }>({});

  const validateForm = () => {
    const errors: {
      industry?: string;
      jobRole?: string;
      jobDescription?: string;
    } = {};
    let isValid = true;

    if (!industry) {
      errors.industry = "Please select an industry";
      isValid = false;
    }
    
    if (!jobRole.trim()) {
      errors.jobRole = "Please enter a job role";
      isValid = false;
    } else if (jobRole.trim().length < 3) {
      errors.jobRole = "Job role must be at least 3 characters";
      isValid = false;
    }
    
    if (!jobDescription.trim()) {
      errors.jobDescription = "Please enter a job description";
      isValid = false;
    } else if (jobDescription.trim().length < 50) {
      errors.jobDescription = "Job description should be more detailed (at least 50 characters)";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with:", { industry, jobRole, jobDescription });
    
    if (!validateForm()) {
      console.log("Form validation failed:", formErrors);
      toast({
        title: "Missing information",
        description: "Please fill out all required fields correctly",
        variant: "destructive"
      });
      return;
    }
    
    // Clear any previous errors
    setFormErrors({});
    
    // Log that we're submitting the form
    console.log("Form validated, submitting to parent component");
    
    // Submit to parent
    onSubmit(industry, jobRole, jobDescription);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Job Interview Simulator</CardTitle>
          <CardDescription>
            Enter the details about the job you're interviewing for, and we'll generate a tailored
            interview experience with AI-powered questions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="industry" className="flex justify-between">
              Industry <span className="text-red-500">*</span>
            </Label>
            <SelectInput
              id="industry"
              value={industry}
              onChange={(val) => {
                setIndustry(val);
                setFormErrors(prev => ({ ...prev, industry: undefined }));
              }}
              options={INDUSTRY_OPTIONS}
              placeholder="Select an industry"
              className={`w-full ${formErrors.industry ? 'border-red-500' : ''}`}
            />
            {formErrors.industry && (
              <p className="text-sm text-red-500">{formErrors.industry}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jobRole" className="flex justify-between">
              Job Role <span className="text-red-500">*</span>
            </Label>
            <Input
              id="jobRole"
              value={jobRole}
              onChange={(e) => {
                setJobRole(e.target.value);
                setFormErrors(prev => ({ ...prev, jobRole: undefined }));
              }}
              placeholder="E.g., Software Engineer, Marketing Manager"
              className={`w-full ${formErrors.jobRole ? 'border-red-500' : ''}`}
            />
            {formErrors.jobRole && (
              <p className="text-sm text-red-500">{formErrors.jobRole}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jobDescription" className="flex justify-between">
              Job Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setFormErrors(prev => ({ ...prev, jobDescription: undefined }));
              }}
              placeholder="Paste the job description here..."
              className={`h-32 resize-none ${formErrors.jobDescription ? 'border-red-500' : ''}`}
            />
            {formErrors.jobDescription && (
              <p className="text-sm text-red-500">{formErrors.jobDescription}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Paste the job description to help the AI generate more relevant questions.
              <br />
              More detailed descriptions (100+ words) will result in better questions.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Generating Interview..." : "Start Interview Simulation"}
          </Button>
          {isLoading && (
            <p className="text-xs text-muted-foreground text-center">
              This may take a few moments as we craft personalized questions...
            </p>
          )}
        </CardFooter>
      </Card>
    </form>
  );
};
