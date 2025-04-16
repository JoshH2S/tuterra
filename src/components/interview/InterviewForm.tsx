
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectInput } from "@/components/interview/SelectInput";
import { INDUSTRY_OPTIONS } from "@/components/interview/constants";
import { interviewSchema, type InterviewFormData } from "@/hooks/interview/utils/validation";
import { Progress } from "@/components/ui/progress";

interface InterviewFormProps {
  onSubmit: (data: InterviewFormData) => Promise<void>;
  isLoading?: boolean;
  progress?: number;
}

export const InterviewForm = ({ onSubmit, isLoading = false, progress = 0 }: InterviewFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InterviewFormData>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      industry: "",
      jobTitle: "",
      jobDescription: ""
    }
  });

  const handleFormSubmit = async (data: InterviewFormData) => {
    if (isSubmitting || isLoading) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error during form submission:", error);
      // Error toast is handled in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const showProgress = isLoading && progress > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="w-full">
        <Card className="w-full max-w-2xl mx-auto shadow-md">
          <CardHeader className="space-y-1 sm:space-y-2">
            <CardTitle className="text-xl sm:text-2xl text-center sm:text-left">Job Interview Simulator</CardTitle>
            <CardDescription className="text-sm sm:text-base text-center sm:text-left">
              Enter the details about the job you're interviewing for, and we'll generate a tailored
              interview experience with AI-powered questions.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-6">
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex justify-between text-sm sm:text-base">
                    Industry <span className="text-red-500">*</span>
                  </FormLabel>
                  <SelectInput
                    id="industry"
                    value={field.value}
                    onChange={field.onChange}
                    options={INDUSTRY_OPTIONS}
                    placeholder="Select an industry"
                    className="w-full"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex justify-between text-sm sm:text-base">
                    Job Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="jobTitle"
                      placeholder="Enter the job title"
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex justify-between text-sm sm:text-base">
                    Job Description <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the job description here..."
                      className="h-24 sm:h-32 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Paste the job description to help the AI generate more relevant questions.
                    <br />
                    More detailed descriptions (100+ words) will result in better questions.
                  </p>
                </FormItem>
              )}
            />

            {showProgress && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {progress < 30 && "Preparing your interview..."}
                  {progress >= 30 && progress < 60 && "Creating personalized questions..."}
                  {progress >= 60 && progress < 90 && "Finalizing your interview..."}
                  {progress >= 90 && "Almost ready..."}
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2 px-6 pb-6">
            <Button 
              type="submit" 
              className="w-full py-5 text-base font-medium touch-manipulation" 
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? "Creating Interview..." : "Start Interview Simulation"}
            </Button>
            {(isLoading || isSubmitting) && !showProgress && (
              <p className="text-xs sm:text-sm text-muted-foreground text-center mt-2">
                This may take a few moments as we craft personalized questions...
              </p>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
