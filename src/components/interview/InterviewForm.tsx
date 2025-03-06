
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!industry) {
      toast({
        title: "Missing information",
        description: "Please select an industry",
        variant: "destructive"
      });
      return;
    }
    
    if (!jobRole.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a job role",
        variant: "destructive"
      });
      return;
    }
    
    if (!jobDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a job description",
        variant: "destructive"
      });
      return;
    }
    
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
            <Label htmlFor="industry">Industry</Label>
            <SelectInput
              id="industry"
              value={industry}
              onChange={setIndustry}
              options={INDUSTRY_OPTIONS}
              placeholder="Select an industry"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jobRole">Job Role</Label>
            <Input
              id="jobRole"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="E.g., Software Engineer, Marketing Manager"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="h-32 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Paste the job description to help the AI generate more relevant questions.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Generating Interview..." : "Start Interview Simulation"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};
