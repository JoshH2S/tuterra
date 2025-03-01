
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  industry: z.string().min(2, "Industry must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  questionCount: z.number().min(10, "Minimum of 10 questions required").max(50, "Maximum of 50 questions allowed"),
  additionalInfo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SkillAssessmentFormProps {
  onCancel: () => void;
}

export function SkillAssessmentForm({ onCancel }: SkillAssessmentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industry: "",
      role: "",
      questionCount: 10,
      additionalInfo: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create an assessment",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate the assessment using our API function
      const response = await supabase.functions.invoke("generate-skill-assessment", {
        body: {
          industry: data.industry,
          role: data.role,
          questionCount: data.questionCount,
          additionalInfo: data.additionalInfo || "",
        },
      });

      if (response.error) throw new Error(response.error.message);
      
      const { assessment } = response.data;

      // Save the assessment to the database
      const { data: savedAssessment, error } = await supabase
        .from("skill_assessments")
        .insert({
          title: `${data.role} in ${data.industry}`,
          industry: data.industry,
          role: data.role,
          creator_id: user.id,
          questions: assessment.questions,
          description: assessment.description,
          skills_tested: assessment.skills_tested,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Assessment created",
        description: "Your skill assessment has been generated successfully",
      });

      // Navigate to the newly created assessment
      navigate(`/take-skill-assessment/${savedAssessment.id}`);
    } catch (error) {
      console.error("Error creating assessment:", error);
      toast({
        title: "Error",
        description: "Failed to create assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Technology, Healthcare, Finance" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Role</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Frontend Developer, Data Analyst" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="questionCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Questions</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={10}
                  max={50}
                  className="w-32"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Information (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Specific skills or technologies to focus on"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Assessment"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
