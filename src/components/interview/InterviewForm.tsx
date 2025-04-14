import { useState, useEffect } from "react";
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

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log("InterviewForm state updated:", { 
      industry, 
      jobRole: `'${jobRole}'`, 
      jobRoleLength: jobRole ? jobRole.length : 0,
      jobRoleTrimmed: jobRole ? jobRole.trim().length : 0,
      jobDescription: jobDescription.substring(0, 30) + (jobDescription.length > 30 ? "..." : "") 
    });
  }, [industry, jobRole, jobDescription]);

  const validateForm = () => {
    const errors: {
      industry?: string;
      jobRole?: string;
      jobDescription?: string;
    } = {};
    let isValid = true;

    // Validate industry with clear logging
    if (!industry?.trim()) {
      console.log("Industry validation failed: empty value");
      errors.industry = "Please select a valid industry";
      isValid = false;
    }
    
    // Enhanced job role validation with detailed logging
    if (typeof jobRole !== 'string' || !jobRole.trim()) {
      console.log("Job role validation failed:", {
        value: `'${jobRole}'`,
        type: typeof jobRole,
        length: jobRole ? jobRole.length : 0,
        isEmpty: !jobRole,
        isEmptyTrimmed: jobRole ? !jobRole.trim() : true
      });
      errors.jobRole = "Please enter a job role";
      isValid = false;
    } else {
      console.log("Job role validation passed:", {
        value: `'${jobRole}'`,
        length: jobRole.length,
        trimmedLength: jobRole.trim().length
      });
    }
    
    // Validate description
    if (!jobDescription?.trim()) {
      errors.jobDescription = "Please enter a job description";
      isValid = false;
    } else if (jobDescription.trim().length < 50) {
      errors.jobDescription = "Job description should be more detailed (at least 50 characters)";
      isValid = false;
    }

    console.log("Form validation result:", { isValid, errors });
    setFormErrors(errors);
    return isValid;
  };

  const handleIndustryChange = (value: string) => {
    console.log("Industry selection changed:", value);
    if (value) {
      setIndustry(value);
      setFormErrors(prev => ({ ...prev, industry: undefined }));
    } else {
      console.error("Empty industry value received");
    }
  };

  const handleJobRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    console.log("Job role changed:", {
      value: `'${val}'`,
      length: val.length,
      trimmedLength: val.trim().length
    });
    setJobRole(val);
    
    // Clear error when user types something valid
    if (val?.trim()) {
      setFormErrors(prev => ({ ...prev, jobRole: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add detailed debug info to help troubleshoot
    console.log("InterviewForm submission attempt with values:", {
      industry: `'${industry}'`,
      jobRole: {
        value: `'${jobRole}'`,
        length: jobRole ? jobRole.length : 0,
        trimmed: jobRole ? `'${jobRole.trim()}'` : '',
        trimmedLength: jobRole ? jobRole.trim().length : 0
      },
      jobDescription: {
        preview: jobDescription.substring(0, 50) + "...",
        length: jobDescription.length,
        trimmedLength: jobDescription.trim().length
      }
    });
    
    // Pre-validation check for job role to catch edge cases
    if (typeof jobRole !== 'string' || !jobRole.trim()) {
      console.error("Job role validation failed - empty or invalid value:", {
        value: `'${jobRole}'`,
        type: typeof jobRole
      });
      
      setFormErrors(prev => ({
        ...prev,
        jobRole: "Please enter a job role"
      }));
      
      toast({
        title: "Missing information",
        description: "Please enter a job role",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateForm()) {
      console.log("Form validation failed with errors:", formErrors);
      toast({
        title: "Missing information",
        description: "Please fill out all required fields correctly",
        variant: "destructive"
      });
      return;
    }
    
    // Final validation check before submission
    if (!industry.trim() || !jobRole.trim() || !jobDescription.trim()) {
      console.error("Critical validation failure - empty values detected after validation passed:", {
        industry: `'${industry}'`,
        jobRole: `'${jobRole}'`,
        jobDescription: jobDescription.trim().length
      });
      toast({
        title: "Missing information",
        description: "Please ensure all fields are properly filled out",
        variant: "destructive"
      });
      return;
    }
    
    setFormErrors({});
    
    console.log("Form validated successfully, submitting with values:", {
      industry,
      jobRole: jobRole.trim(),
      jobRole_trimmedLength: jobRole.trim().length,
      jobDescriptionLength: jobDescription.length
    });
    
    // Submit with trimmed values
    onSubmit(industry, jobRole.trim(), jobDescription);
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
              onChange={handleIndustryChange}
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
            <Input
              id="jobRole"
              name="jobRole"
              value={jobRole}
              onChange={handleJobRoleChange}
              onBlur={(e) => {
                // Validate on blur
                if (!e.target.value?.trim()) {
                  setFormErrors(prev => ({ ...prev, jobRole: "Please enter a job role" }));
                }
              }}
              placeholder="Enter the job role"
              className={`w-full ${formErrors.jobRole ? 'border-red-500' : ''}`}
              required
              aria-required="true"
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
                if (e.target.value.trim().length >= 50) {
                  setFormErrors(prev => ({ ...prev, jobDescription: undefined }));
                }
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
