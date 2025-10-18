import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Building, 
  PenTool,
  Loader2
} from "lucide-react";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { useCompanyApplications } from "@/hooks/useCompanyApplications";

interface PortfolioSubmissionDialogProps {
  sessionId: string;
  userId: string;
  onSubmissionComplete?: () => void;
}

export function PortfolioSubmissionDialog({ 
  sessionId, 
  userId, 
  onSubmissionComplete 
}: PortfolioSubmissionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  // Get portfolio data
  const { portfolioData, loading: portfolioLoading } = usePortfolioData(sessionId, userId);
  const { companies, loading: companiesLoading } = useCompanyApplications(sessionId, userId);

  // Calculate completion status
  const getCompletionStatus = () => {
    if (portfolioLoading || companiesLoading) {
      return { isComplete: false, completedItems: 0, totalItems: 0, missingItems: [] };
    }

    let completedItems = 0;
    let totalItems = 1 + companies.length; // 1 reflection + (actual companies × 1 component each: application sent)
    const missingItems: string[] = [];

    // Check reflection essay (minimum 200 characters)
    if (portfolioData.reflectionEssay.trim().length > 200) {
      completedItems += 1;
    } else {
      missingItems.push("Reflective Essay (minimum 200 characters)");
    }

    // Check companies - only require application sent for completion
    companies.forEach((company, index) => {
      const companyNum = index + 1;
      
      // Only require application sent for portfolio completion
      if (company.applicationSent) {
        completedItems += 1;
      } else {
        missingItems.push(`Company #${companyNum}: Mark Application as Sent`);
      }
    });

    const isComplete = completedItems === totalItems;
    return { isComplete, completedItems, totalItems, missingItems };
  };

  const { isComplete, completedItems, totalItems, missingItems } = getCompletionStatus();
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleSubmit = async () => {
    if (!isComplete) {
      toast({
        title: "Portfolio Incomplete",
        description: "Please complete all required sections before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create or update final submission record with portfolio data
      const { error: submissionError } = await supabase
        .from('internship_final_submissions')
        .upsert({
          session_id: sessionId,
          user_id: userId,
          file_url: null, // No file upload needed - portfolio is in database
          external_link: null,
          reflection: portfolioData.reflectionEssay,
          submitted_at: new Date().toISOString()
        }, {
          onConflict: 'session_id'
        });
      
      if (submissionError) {
        throw submissionError;
      }
      
      // Update internship session as completed
      const { error: updateError } = await supabase
        .from('internship_sessions')
        .update({ is_completed: true })
        .eq('id', sessionId);
      
      if (updateError) {
        throw updateError;
      }
      
      toast({
        title: "Portfolio Submitted Successfully!",
        description: "Your career application portfolio has been submitted. You can now generate your certificate.",
      });
      
      setIsOpen(false);
      onSubmissionComplete?.();
      
    } catch (error) {
      console.error('Error submitting portfolio:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your portfolio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="whitespace-nowrap"
          disabled={portfolioLoading || companiesLoading}
        >
          Submit Final Project
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submit Career Application Portfolio
          </DialogTitle>
          <DialogDescription>
            Review your portfolio completion status and submit your final project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Completion Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Portfolio Completion Status
                <Badge variant={isComplete ? "default" : "secondary"}>
                  {completionPercentage}% Complete
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Reflection Essay */}
                <div className="flex items-center gap-2">
                  {portfolioData.reflectionEssay.length > 200 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="text-sm">
                    Reflective Essay ({portfolioData.reflectionEssay.length} characters)
                  </span>
                </div>

                {/* Company Applications */}
                {companies.map((company, index) => {
                  const hasBasicInfo = company.companyName.trim() && company.position.trim();
                  const hasResearch = company.researchNotes.trim().length > 0;
                  const hasCoverLetter = company.coverLetter.trim().length > 0;
                  const isApplicationSent = company.applicationSent || false;
                  const isFullyComplete = isApplicationSent; // Only require application sent
                  
                  return (
                    <div key={company.id} className="flex items-center gap-2">
                      {isFullyComplete ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="text-sm">
                        Company #{index + 1}: {company.companyName || 'Unnamed Company'}
                        {isApplicationSent && (
                          <span className="text-green-600 ml-2 text-xs">✓ Sent</span>
                        )}
                        {!isFullyComplete && (
                          <span className="text-muted-foreground ml-1">
                            (Missing: Mark as Sent)
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Missing Items Warning */}
          {!isComplete && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Missing Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-amber-700 space-y-1">
                  {missingItems.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
                <p className="text-sm text-amber-600 mt-3">
                  Please complete these sections before submitting your portfolio.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!isComplete || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Portfolio'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
