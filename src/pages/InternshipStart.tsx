
import React, { useState, useEffect } from "react";
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
import { useInternshipForm } from "@/hooks/internship/useInternshipForm";

const InternshipStart = () => {
  const navigate = useNavigate();
  
  // Use the centralized form hook for all form logic
  const {
    formData,
    handleChange,
    handleSubmit,
    submitting,
    progressStatus,
    authLoading,
    formReady,
    user,
    session
  } = useInternshipForm();
  
  // Log component render for debugging
  useEffect(() => {
    console.log("🔍 InternshipStart: Component rendered", { 
      authLoading, 
      formReady,
      hasUser: !!user,
      hasSession: !!session
    });
  }, [authLoading, formReady, user, session]);

  // Show loading state while authentication is being determined
  if (authLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md shadow-md">
          <CardHeader>
            <CardTitle className="text-center">Loading</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <LoadingSpinner size="default" />
            <p className="mt-4 text-muted-foreground text-center">
              Checking authentication status...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      <div className="mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Start Your Virtual Internship</h1>
        <p className="text-muted-foreground px-4">
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
          <CardContent className="space-y-5">
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
                disabled={!formReady || submitting}
                autoComplete="off"
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
                disabled={!formReady || submitting}
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
                rows={5}
                required
                className="w-full"
                disabled={!formReady || submitting}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full py-6"
              disabled={!formReady || submitting}
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="small" />
                  <span>{progressStatus || "Processing..."}</span>
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
