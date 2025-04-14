import React, { useState, useEffect } from "react";
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
import { Loader2, Sparkles, Lock, Info, AlertCircle } from "lucide-react";
import { useSkillAssessmentGeneration } from "@/hooks/useSkillAssessmentGeneration";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserCredits } from "@/hooks/useUserCredits";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  industry: z.string().min(2, "Industry must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  questionCount: z.number().min(10, "Minimum of 10 questions required").max(50, "Maximum of 50 questions allowed"),
  additionalInfo: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
});

type FormValues = z.infer<typeof formSchema>;

interface SkillAssessmentFormProps {
  onCancel: () => void;
}

export function SkillAssessmentForm({ onCancel }: SkillAssessmentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userTier, setUserTier] = useState<string>("free");
  const [assessmentsRemaining, setAssessmentsRemaining] = useState<number>(0);
  const [isCheckingAllowance, setIsCheckingAllowance] = useState<boolean>(true);
  const [checkError, setCheckError] = useState<string | null>(null);
  const { 
    generateAssessment, 
    isGenerating, 
    progress, 
    checkAssessmentAllowance,
    getUserTier,
    getMonthlyAssessmentCount
  } = useSkillAssessmentGeneration();
  const { credits, fetchUserCredits, isOfflineMode, retryFetch } = useUserCredits();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industry: "",
      role: "",
      questionCount: 10,
      additionalInfo: "",
      level: "intermediate",
    },
  });

  const checkUserAllowance = async () => {
    if (!user) {
      setIsCheckingAllowance(false);
      return;
    }

    setIsCheckingAllowance(true);
    setCheckError(null);
    
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Allowance check timed out")), 5000)
      );
      
      await Promise.race([
        (async () => {
          await fetchUserCredits();
          
          const tier = await getUserTier();
          setUserTier(tier);
          
          const monthlyCount = await getMonthlyAssessmentCount();
          
          const remainingCredits = credits?.assessment_credits || 0;
          
          console.log('User tier:', tier);
          console.log('Monthly assessment count:', monthlyCount);
          console.log('Remaining credits:', remainingCredits);
          
          if (tier === 'premium') {
            setAssessmentsRemaining(Infinity);
          } else if (tier === 'pro') {
            const monthlyRemaining = Math.max(0, 20 - monthlyCount);
            setAssessmentsRemaining(Math.min(remainingCredits, monthlyRemaining));
          } else {
            const monthlyRemaining = Math.max(0, 2 - monthlyCount); 
            setAssessmentsRemaining(Math.min(remainingCredits, monthlyRemaining));
          }
          
          if (isOfflineMode) {
            setAssessmentsRemaining(remainingCredits);
          }
        })(),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Error checking user allowance:', error);
      setCheckError(error instanceof Error ? error.message : 'Failed to check allowance');
      
      if (credits?.assessment_credits) {
        setAssessmentsRemaining(credits.assessment_credits);
      }
    } finally {
      setIsCheckingAllowance(false);
    }
  };

  useEffect(() => {
    checkUserAllowance();
    
    const checkInterval = setInterval(() => {
      if (isCheckingAllowance) {
        console.log('Still checking assessment allowance after delay, attempting to recover...');
        setIsCheckingAllowance(false);
        
        if (credits?.assessment_credits) {
          setAssessmentsRemaining(credits.assessment_credits);
        } else {
          setAssessmentsRemaining(2);
        }
      }
    }, 8000);
    
    return () => clearInterval(checkInterval);
  }, [user, credits?.assessment_credits]);

  useEffect(() => {
    if (credits && !isCheckingAllowance) {
      if (userTier === 'premium') {
        setAssessmentsRemaining(Infinity);
      } else {
        setAssessmentsRemaining(credits.assessment_credits || 0);
      }
    }
  }, [credits, userTier]);

  const showPremiumFeatures = userTier !== 'free';
  const isPremium = userTier === 'premium';
  const isPro = userTier === 'pro';

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create an assessment",
        variant: "destructive",
      });
      return;
    }

    const canGenerate = await checkAssessmentAllowance();
    if (!canGenerate) {
      toast({
        title: "Assessment limit reached",
        description: "You have reached your monthly limit or used all your assessment credits. Upgrade your subscription to create more.",
        variant: "destructive",
      });
      return;
    }

    try {
      const assessment = await generateAssessment({
        industry: data.industry,
        role: data.role,
        questionCount: data.questionCount,
        additionalInfo: data.additionalInfo || "",
        level: data.level,
      });

      if (!assessment) {
        throw new Error('Failed to generate assessment');
      }

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
          level: data.level,
          tier: userTier,
        })
        .select()
        .single();

      if (error) throw error;

      setAssessmentsRemaining(prev => Math.max(0, prev - 1));
      
      toast({
        title: "Assessment created",
        description: "Your skill assessment has been generated successfully",
      });

      navigate(`/assessments/take-skill-assessment/${savedAssessment.id}`);
      return Promise.resolve();
    } catch (error) {
      console.error("Error creating assessment:", error);
      toast({
        title: "Error",
        description: "Failed to create assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <div className="mb-4">
        {checkError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              Having trouble checking your assessment credits.
              <Button 
                variant="link" 
                className="p-0 h-auto ml-2"
                onClick={() => checkUserAllowance()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
      
        {assessmentsRemaining < Infinity && (
          <div className="bg-muted p-3 rounded-md mb-4 flex items-center gap-2">
            <Info size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {isCheckingAllowance ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin mr-2 h-3 w-3" />
                  Checking assessment allowance...
                </span>
              ) : (
                <>
                  {assessmentsRemaining} assessment{assessmentsRemaining !== 1 ? 's' : ''} remaining this month
                  {userTier === 'free' && (
                    <Button variant="link" className="p-0 h-auto ml-2" onClick={() => toast({
                      title: "Upgrade your plan",
                      description: "Premium users can generate unlimited assessments",
                    })}>
                      Upgrade for more
                    </Button>
                  )}
                </>
              )}
            </span>
          </div>
        )}
      </div>

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
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty Level</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">
                    Advanced 
                    {!showPremiumFeatures && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Lock size={14} className="ml-2 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Upgrade to Pro or Premium to access Advanced level</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </SelectItem>
                </SelectContent>
              </Select>
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
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">10</span>
                  <span className="text-sm font-medium">{field.value}</span>
                  <span className="text-sm">
                    {isPremium ? '50' : isPro ? '30' : '20'}
                    {!isPremium && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Lock size={14} className="ml-1 inline-block" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Premium users can create up to 50 questions</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </span>
                </div>
                <FormControl>
                  <Slider
                    min={10}
                    max={isPremium ? 50 : isPro ? 30 : 20}
                    step={1}
                    value={[field.value]}
                    onValueChange={(vals) => field.onChange(vals[0])}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Additional Information (Optional)
                {showPremiumFeatures && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Sparkles size={16} className="text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>As a {userTier} user, your additional information will receive enhanced processing</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Specific skills or technologies to focus on"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {showPremiumFeatures 
                  ? "Pro and Premium assessments feature deeper industry context and more detailed questions."
                  : "Add specific technologies or skills you want to focus on."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {isGenerating && (
          <div className="space-y-2 my-4">
            <div className="flex justify-between text-sm">
              <span>Generating your assessment...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {progress < 30 ? "Preparing assessment parameters..." :
               progress < 60 ? "Creating tailored questions..." :
               progress < 90 ? "Finalizing skill assessment..." :
               "Almost done..."}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isGenerating || 
              (assessmentsRemaining <= 0 && !isCheckingAllowance) || 
              isCheckingAllowance}
            className="relative"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : isCheckingAllowance ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                Generate Assessment
                {showPremiumFeatures && <Sparkles size={16} className="ml-2 text-amber-500" />}
              </>
            )}
          </Button>
        </div>

        {assessmentsRemaining <= 0 && !isCheckingAllowance && (
          <div className="mt-2 text-center">
            <p className="text-sm text-muted-foreground">
              You have reached your monthly limit or used all your credits. 
              <Button variant="link" className="p-0 h-auto ml-1" onClick={() => toast({
                title: "Upgrade your plan",
                description: "Premium users can generate unlimited assessments",
              })}>
                Upgrade now
              </Button>
            </p>
          </div>
        )}
      </form>
    </Form>
  );
}
