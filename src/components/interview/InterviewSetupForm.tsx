
import React, { useState } from 'react';
import { useInterview } from '@/contexts/InterviewContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { INDUSTRY_OPTIONS, JOB_TITLE_OPTIONS } from '@/constants/interviewOptions';

export const InterviewSetupForm: React.FC = () => {
  const { createSession, state } = useInterview();
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [errors, setErrors] = useState({
    jobTitle: '',
    industry: '',
    jobDescription: ''
  });

  const validateForm = () => {
    const newErrors = {
      jobTitle: '',
      industry: '',
      jobDescription: ''
    };
    
    let isValid = true;
    
    if (!jobTitle) {
      newErrors.jobTitle = 'Please select a job title';
      isValid = false;
    }
    
    if (!industry) {
      newErrors.industry = 'Please select an industry';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    await createSession(jobTitle, industry, jobDescription);
  };

  const isLoading = state.status === 'loading';

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Job Interview Simulator</CardTitle>
        <CardDescription>
          Enter the details of the job you're interviewing for to get personalized interview questions.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title <span className="text-red-500">*</span></Label>
            <Select 
              value={jobTitle} 
              onValueChange={(value) => {
                setJobTitle(value);
                setErrors(prev => ({ ...prev, jobTitle: '' }));
              }}
            >
              <SelectTrigger id="job-title" className={errors.jobTitle ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a job title" />
              </SelectTrigger>
              <SelectContent>
                {JOB_TITLE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.jobTitle && <p className="text-sm text-red-500">{errors.jobTitle}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry <span className="text-red-500">*</span></Label>
            <Select 
              value={industry} 
              onValueChange={(value) => {
                setIndustry(value);
                setErrors(prev => ({ ...prev, industry: '' }));
              }}
            >
              <SelectTrigger id="industry" className={errors.industry ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select an industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry && <p className="text-sm text-red-500">{errors.industry}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="job-description">
              Job Description <span className="text-muted-foreground text-sm">(optional)</span>
            </Label>
            <Textarea
              id="job-description"
              placeholder="Paste the job description here for more tailored questions..."
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Adding a job description will help generate more relevant interview questions.
            </p>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Generating Questions...' : 'Start Interview Simulation'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
