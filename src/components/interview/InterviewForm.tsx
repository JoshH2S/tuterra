
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { SelectInput } from "@/components/interview/SelectInput";
import { INDUSTRY_OPTIONS, JOB_ROLE_OPTIONS } from "@/components/interview/constants";

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
      errors.jobRole = "Please select a job role";
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
    
    setFormErrors({});
    
    console.log("Form validated, submitting to parent component");
    
    onSubmit(industry, jobRole, jobDescription);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Card className="w-full max-w-2xl mx-auto shadow-md">
        <CardHeader className="space-y-1 sm:space-y-2">
          <CardTitle className="text-xl sm:text-2xl text-center sm:text-left">Job Interview Simulator</CardTitle>
          <CardDescription className="text-sm sm:text-base text-center sm:text-left">
            Enter the details about the job you're interviewing for, and we'll generate a tailored
            interview experience with AI-powered questions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="industry" className="flex justify-between text-sm sm:text-base">
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
              <p className="text-xs sm:text-sm text-red-500">{formErrors.industry}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jobRole" className="flex justify-between text-sm sm:text-base">
              Job Role <span className="text-red-500">*</span>
            </Label>
            <SelectInput
              id="jobRole"
              value={jobRole}
              onChange={(val) => {
                setJobRole(val);
                setFormErrors(prev => ({ ...prev, jobRole: undefined }));
              }}
              options={JOB_ROLE_OPTIONS}
              placeholder="Select a job role"
              className={`w-full ${formErrors.jobRole ? 'border-red-500' : ''}`}
            />
            {formErrors.jobRole && (
              <p className="text-xs sm:text-sm text-red-500">{formErrors.jobRole}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jobDescription" className="flex justify-between text-sm sm:text-base">
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
              className={`h-24 sm:h-32 resize-none ${formErrors.jobDescription ? 'border-red-500' : ''}`}
            />
            {formErrors.jobDescription && (
              <p className="text-xs sm:text-sm text-red-500">{formErrors.jobDescription}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Paste the job description to help the AI generate more relevant questions.
              <br />
              More detailed descriptions (100+ words) will result in better questions.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 px-6 pb-6">
          <Button 
            type="submit" 
            className="w-full py-5 text-base font-medium" 
            disabled={isLoading}
          >
            {isLoading ? "Generating Interview..." : "Start Interview Simulation"}
          </Button>
          {isLoading && (
            <p className="text-xs sm:text-sm text-muted-foreground text-center mt-2">
              This may take a few moments as we craft personalized questions...
            </p>
          )}
        </CardFooter>
      </Card>
    </form>
  );
};
