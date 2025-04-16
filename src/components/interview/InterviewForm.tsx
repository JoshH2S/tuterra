
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
  onSubmit: (industry: string, jobTitle: string, jobDescription: string) => void;
  isLoading?: boolean;
}

export const InterviewForm = ({ onSubmit, isLoading = false }: InterviewFormProps) => {
  const [industry, setIndustry] = useState<string>("");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{
    industry?: string;
    jobTitle?: string;
    jobDescription?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("InterviewForm state updated:", { 
      industry, 
      jobTitle: `'${jobTitle}'`, 
      jobTitleLength: jobTitle ? jobTitle.length : 0,
      jobTitleTrimmed: jobTitle ? jobTitle.trim().length : 0,
      jobDescription: jobDescription.substring(0, 30) + (jobDescription.length > 30 ? "..." : "") 
    });
  }, [industry, jobTitle, jobDescription]);

  const validateForm = () => {
    const errors: {
      industry?: string;
      jobTitle?: string;
      jobDescription?: string;
    } = {};
    let isValid = true;

    if (!industry?.trim()) {
      console.log("Industry validation failed: empty value");
      errors.industry = "Please select a valid industry";
      isValid = false;
    }
    
    // Stricter job title validation
    if (!jobTitle) {
      console.log("Job title validation failed: value is null or undefined");
      errors.jobTitle = "Please enter a job title";
      isValid = false;
    } else if (jobTitle.trim() === "") {
      console.log("Job title validation failed: value is empty or whitespace", {
        jobTitle: `'${jobTitle}'`,
        length: jobTitle.length,
        trimmedLength: jobTitle.trim().length
      });
      errors.jobTitle = "Please enter a job title";
      isValid = false;
    } else {
      console.log("Job title validation passed:", {
        value: `'${jobTitle}'`,
        length: jobTitle.length,
        trimmedLength: jobTitle.trim().length
      });
    }
    
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

  const handleJobTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    console.log("Job title changed:", {
      value: `'${val}'`,
      length: val.length,
      trimmedLength: val.trim().length
    });
    setJobTitle(val);
    
    if (val && val.trim() !== "") {
      setFormErrors(prev => ({ ...prev, jobTitle: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || isLoading) {
      console.log("Preventing duplicate submission");
      return;
    }
    
    setIsSubmitting(true);
    
    console.log("InterviewForm submission attempt with values:", {
      industry: `'${industry}'`,
      jobTitle: {
        value: `'${jobTitle}'`,
        length: jobTitle ? jobTitle.length : 0,
        trimmed: jobTitle ? `'${jobTitle.trim()}'` : '',
        trimmedLength: jobTitle ? jobTitle.trim().length : 0
      },
      jobDescription: {
        preview: jobDescription.substring(0, 50) + "...",
        length: jobDescription.length,
        trimmedLength: jobDescription.trim().length
      }
    });
    
    if (!validateForm()) {
      console.log("Form validation failed with errors:", formErrors);
      toast({
        title: "Missing information",
        description: "Please fill out all required fields correctly",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const finalIndustry = industry.trim();
      const finalJobTitle = jobTitle.trim();
      const finalJobDescription = jobDescription.trim();
      
      console.log("Form validated successfully, submitting with values:", {
        industry: finalIndustry,
        jobTitle: finalJobTitle,
        jobTitleLength: finalJobTitle.length,
        jobDescriptionLength: finalJobDescription.length
      });
      
      await onSubmit(finalIndustry, finalJobTitle, finalJobDescription);
    } catch (error) {
      console.error("Error during form submission:", error);
      toast({
        title: "Submission Error",
        description: "An error occurred while submitting the form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <Label htmlFor="jobTitle" className="flex justify-between text-sm sm:text-base">
              Job Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              value={jobTitle}
              onChange={handleJobTitleChange}
              onBlur={(e) => {
                if (!e.target.value?.trim()) {
                  setFormErrors(prev => ({ ...prev, jobTitle: "Please enter a job title" }));
                }
              }}
              placeholder="Enter the job title"
              className={`w-full ${formErrors.jobTitle ? 'border-red-500' : ''}`}
              required
              aria-required="true"
            />
            {formErrors.jobTitle && (
              <p className="text-xs sm:text-sm text-red-500">{formErrors.jobTitle}</p>
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
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? "Generating Interview..." : "Start Interview Simulation"}
          </Button>
          {(isLoading || isSubmitting) && (
            <p className="text-xs sm:text-sm text-muted-foreground text-center mt-2">
              This may take a few moments as we craft personalized questions...
            </p>
          )}
        </CardFooter>
      </Card>
    </form>
  );
};
