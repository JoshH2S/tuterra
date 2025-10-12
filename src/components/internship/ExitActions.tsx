import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { Award, Download, FileText, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useInternshipCompletion } from "@/hooks/useInternshipCompletion";
import { CertificateGenerator } from "@/services/certificateGenerator";
import { ReportGenerator } from "@/services/reportGenerator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ExitActionsProps {
  sessionId: string;
}

export function ExitActions({ sessionId }: ExitActionsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  const { completionData, loading: completionLoading, fetchCompletionData } = useInternshipCompletion(
    sessionId, 
    user?.id || ''
  );

  // Load completion data on mount
  useEffect(() => {
    if (sessionId && user?.id) {
      fetchCompletionData();
    }
  }, [sessionId, user?.id, fetchCompletionData]);

  const handleGenerateCertificate = async () => {
    if (!completionData || !user) {
      toast({
        title: "Unable to generate certificate",
        description: "Please complete the internship first.",
        variant: "destructive"
      });
      return;
    }

    if (!completionData.isCompleted) {
      toast({
        title: "Internship not completed",
        description: "You need to complete the internship and submit your final project before generating a certificate.",
        variant: "destructive"
      });
      return;
    }

    setGeneratingCertificate(true);
    
    try {
      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, first_name, last_name')
        .eq('id', user.id)
        .single();

      const participantName = profile?.full_name || 
                             `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
                             'Internship Participant';

      const certificateData = {
        participantName,
        jobTitle: completionData.jobTitle,
        industry: completionData.industry,
        companyName: completionData.companyName,
        completedAt: completionData.completedAt || new Date().toISOString(),
        totalXP: completionData.totalXP,
        averageLevel: completionData.averageLevel,
        topSkills: completionData.topSkills,
        completedTasks: completionData.completedTasks,
        totalTasks: completionData.totalTasks
      };

      CertificateGenerator.generateSkillsCertificate(certificateData);

      toast({
        title: "Certificate generated!",
        description: "Your skills-based internship certificate has been downloaded.",
      });

    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Error generating certificate",
        description: "There was an issue creating your certificate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingCertificate(false);
    }
  };
  
  const handleDownloadReport = async () => {
    if (!completionData || !user) {
      toast({
        title: "Unable to generate report",
        description: "Please complete the internship first.",
        variant: "destructive"
      });
      return;
    }

    if (!completionData.isCompleted) {
      toast({
        title: "Internship not completed",
        description: "You need to complete the internship before downloading your performance report.",
        variant: "destructive"
      });
      return;
    }

    setGeneratingReport(true);
    
    try {
      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, first_name, last_name')
        .eq('id', user.id)
        .single();

      const participantName = profile?.full_name || 
                             `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
                             'Internship Participant';

      // Get session start date
      const { data: sessionData } = await supabase
        .from('internship_sessions')
        .select('created_at, start_date')
        .eq('id', sessionId)
        .single();

      const reportData = {
        participantName,
        jobTitle: completionData.jobTitle,
        industry: completionData.industry,
        companyName: completionData.companyName,
        startDate: sessionData?.start_date || sessionData?.created_at || new Date().toISOString(),
        completedAt: completionData.completedAt || new Date().toISOString(),
        totalXP: completionData.totalXP,
        averageLevel: completionData.averageLevel,
        skills: completionData.skills,
        taskSubmissions: completionData.taskSubmissions,
        totalTasks: completionData.totalTasks,
        completedTasks: completionData.completedTasks
      };

      ReportGenerator.generateInternshipReport(reportData);

      toast({
        title: "Report downloaded!",
        description: "Your comprehensive internship performance report has been downloaded.",
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error generating report",
        description: "There was an issue creating your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const getCompletionStatus = () => {
    if (completionLoading) return { icon: <Loader2 className="h-4 w-4 animate-spin" />, text: "Loading...", variant: "secondary" as const };
    if (!completionData) return { icon: <XCircle className="h-4 w-4" />, text: "Not Available", variant: "destructive" as const };
    if (completionData.isCompleted) return { icon: <CheckCircle className="h-4 w-4" />, text: "Available", variant: "success" as const };
    return { icon: <XCircle className="h-4 w-4" />, text: "Complete Internship First", variant: "secondary" as const };
  };

  const status = getCompletionStatus();
  const isAvailable = completionData?.isCompleted || false;

  return (
    <ModernCard>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Exit Actions</h2>
        
        {/* Completion Status */}
        <div className="mb-4 p-3 bg-muted/20 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            {status.icon}
            <span className="text-sm font-medium">Status: {status.text}</span>
          </div>
          {completionData && (
            <div className="text-xs text-muted-foreground">
              Progress: {completionData.completedTasks}/{completionData.totalTasks} tasks • {completionData.totalXP} XP earned
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col">
            {/* Certificate Generation */}
            <Button 
              variant="outline"
              className="gap-2 justify-start h-auto p-4 text-left mb-2"
              onClick={handleGenerateCertificate}
              disabled={!isAvailable || generatingCertificate}
            >
              {generatingCertificate ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <Award className="h-5 w-5 text-primary" />
              )}
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Generate Certificate</span>
                  <Badge variant={status.variant} className="text-xs">
                    {status.text}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {isAvailable 
                    ? "Skills-based completion certificate with your achievements" 
                    : "Available after completing all tasks and final project"}
                </span>
              </div>
            </Button>
            
            {/* Report Download */}
            <Button 
              variant="outline"
              className="gap-2 justify-start h-auto p-4 text-left mb-2"
              onClick={handleDownloadReport}
              disabled={!isAvailable || generatingReport}
            >
              {generatingReport ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <Download className="h-5 w-5 text-primary" />
              )}
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Download Report</span>
                  <Badge variant={status.variant} className="text-xs">
                    {status.text}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {isAvailable 
                    ? "Comprehensive performance report with skills analysis" 
                    : "Detailed internship summary with career insights"}
                </span>
              </div>
            </Button>
            
            {/* Exit to Dashboard */}
            <Button 
              variant="outline"
              className="gap-2 justify-start h-auto p-4 text-left"
              onClick={() => navigate('/dashboard')}
            >
              <FileText className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span className="font-medium">Exit to Dashboard</span>
                <span className="text-xs text-muted-foreground">
                  Return to main dashboard
                </span>
              </div>
            </Button>
          </div>

          {/* Skills Summary Preview */}
          {completionData && completionData.topSkills.length > 0 && (
            <div className="mt-4 p-3 bg-accent/10 rounded-lg border">
              <h4 className="text-sm font-medium mb-2">Top Skills Developed:</h4>
              <div className="flex flex-wrap gap-1">
                {completionData.topSkills.slice(0, 4).map((skillProgress) => (
                  <Badge key={skillProgress.skill_id} variant="secondary" className="text-xs">
                    {skillProgress.skill?.name} (Lv.{skillProgress.current_level})
                  </Badge>
                ))}
                {completionData.topSkills.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{completionData.topSkills.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ModernCard>
  );
}