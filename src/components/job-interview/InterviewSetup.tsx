
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { industries, roles } from "@/data/job-interview-data";

interface InterviewSetupProps {
  industry: string;
  role: string;
  jobDescription: string;
  setIndustry: (industry: string) => void;
  setRole: (role: string) => void;
  setJobDescription: (description: string) => void;
  onStart: () => void;
}

export const InterviewSetup = ({
  industry,
  role,
  jobDescription,
  setIndustry,
  setRole,
  setJobDescription,
  onStart,
}: InterviewSetupProps) => {
  const isFormValid = industry && role && jobDescription.trim().length > 0;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Set Up Your Interview</CardTitle>
        <CardDescription>
          Configure the details for your AI-driven job interview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger id="industry">
                <SelectValue placeholder="Select an industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="jobDescription">Job Description</Label>
          <Textarea
            id="jobDescription"
            placeholder="Paste the job description here..."
            className="min-h-[150px]"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={onStart} 
          className="w-full" 
          size="lg"
          disabled={!isFormValid}
        >
          Start Interview
        </Button>
      </CardContent>
    </Card>
  );
};
