import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Link, FileText, CheckCircle } from "lucide-react";

// Define our own interfaces for database interactions
interface FinalSubmission {
  session_id: string;
  user_id: string;
  file_url: string | null;
  external_link: string | null;
  reflection: string;
  submitted_at: string;
}

interface SessionUpdate {
  is_completed: boolean;
}

interface FinalProjectFormProps {
  sessionId: string;
  userId: string;
}

// Form validation schema
const formSchema = z.object({
  externalLink: z.string().url("Please enter a valid URL").or(z.string().length(0)),
  reflection: z.string().min(50, "Your reflection should be at least 50 characters").max(2000, "Reflection is too long")
});

type FormValues = z.infer<typeof formSchema>;

export function FinalProjectForm({ sessionId, userId }: FinalProjectFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      externalLink: "",
      reflection: ""
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!file) return null;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Create a unique file path that matches RLS policy
      const fileExt = file.name.split('.').pop();
      const fileName = `${sessionId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/internship-submissions/${fileName}`;
      
      // Upload the file
      const { error: uploadError, data } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file, {
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Upload file if one is selected
      let fileUrl = null;
      if (file) {
        fileUrl = await uploadFile();
        if (!fileUrl && file) {
          // If file upload failed but a file was selected, stop submission
          setIsSubmitting(false);
          return;
        }
      }
      
      // Validate that at least one of file or external link is provided
      if (!fileUrl && !values.externalLink) {
        toast({
          title: "Missing submission",
          description: "Please upload a file or provide an external link to your project",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Save submission to database
      const finalSubmission: FinalSubmission = {
        session_id: sessionId,
        user_id: userId,
        file_url: fileUrl,
        external_link: values.externalLink || null,
        reflection: values.reflection,
        submitted_at: new Date().toISOString()
      };
      
      // Use type assertion for the database table name since it's not registered in the types
      const { error: submissionError } = await supabase
        .from('internship_final_submissions' as any)
        .insert(finalSubmission);
      
      if (submissionError) {
        throw submissionError;
      }
      
      // Update internship session as completed
      const sessionUpdate: SessionUpdate = { 
        is_completed: true 
      };
      
      // Use type assertion for the update payload
      const { error: updateError } = await supabase
        .from('internship_sessions')
        .update(sessionUpdate as any)
        .eq('id', sessionId);
      
      if (updateError) {
        throw updateError;
      }
      
      // Show success state
      setIsSubmitted(true);
      
      // Show success toast
      toast({
        title: "Project submitted successfully!",
        description: "Congratulations on completing your internship!",
        variant: "default"
      });
      
      // Navigate to completion page after a short delay
      setTimeout(() => {
        navigate(`/dashboard/virtual-internship/completion?sessionId=${sessionId}`);
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting project:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already submitted, show success state
  if (isSubmitted) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="pt-6 pb-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl mb-2">Project Submitted!</CardTitle>
          <CardDescription className="text-base mb-6">
            Congratulations on completing your virtual internship. You'll be redirected to the completion page.
          </CardDescription>
          <LoadingSpinner size="small" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Submit Final Project</CardTitle>
        <CardDescription>
          Complete your virtual internship by submitting your final project and reflection
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <FormLabel>Upload Project File</FormLabel>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center ${file ? 'border-primary/50 bg-primary/5' : 'border-gray-300 hover:border-primary/50'}`}
              >
                {file ? (
                  <div className="flex flex-col items-center">
                    <FileText className="h-8 w-8 text-primary mb-2" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFile(null)}
                      className="mt-2"
                    >
                      Change file
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Drag and drop or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Support for PDF, PPTX, DOCX, ZIP (Max 10MB)
                    </p>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 relative"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Select file
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.docx,.pptx,.zip,.jpg,.png"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                      />
                    </Button>
                  </div>
                )}
              </div>
              <FormDescription>
                Or, provide an external link below
              </FormDescription>
            </div>
            
            {/* External Link */}
            <FormField
              control={form.control}
              name="externalLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External Project Link (Optional)</FormLabel>
                  <div className="flex items-center space-x-2">
                    <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <FormControl>
                      <Input 
                        placeholder="https://github.com/yourusername/project" 
                        {...field} 
                      />
                    </FormControl>
                  </div>
                  <FormDescription>
                    Link to your project on Google Drive, GitHub, Notion, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Reflection */}
            <FormField
              control={form.control}
              name="reflection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internship Reflection</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your experience, what you learned, and how this internship has helped your professional development..." 
                      className="min-h-[200px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Write a short reflection on your internship experience and what you've learned
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/dashboard/virtual-internship')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || uploading}
            >
              {isSubmitting || uploading ? (
                <>
                  <div className="mr-2">
                    <LoadingSpinner size="small" />
                  </div>
                  {uploading ? `Uploading ${uploadProgress}%` : 'Submitting...'}
                </>
              ) : (
                'Submit Final Project'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
} 