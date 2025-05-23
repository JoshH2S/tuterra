
import { ModernCard } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { FileDown, Award, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExitActionsProps {
  sessionId: string;
}

export function ExitActions({ sessionId }: ExitActionsProps) {
  const navigate = useNavigate();
  
  const handleGenerateCertificate = () => {
    // This would be a future enhancement to generate a certificate
    alert("Certificate generation will be available once you complete the internship.");
  };
  
  const handleDownloadReport = () => {
    // This would be a future enhancement to download an internship report
    alert("Report download will be available once you complete the internship.");
  };

  return (
    <ModernCard>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Exit Actions</h2>
        
        <div className="space-y-4">
          <div className="flex flex-col">
            <Button 
              variant="outline"
              className="gap-2 justify-start h-auto p-4 text-left mb-2"
              onClick={handleGenerateCertificate}
            >
              <Award className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span className="font-medium">Generate Certificate</span>
                <span className="text-xs text-muted-foreground">
                  Available on completion
                </span>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              className="gap-2 justify-start h-auto p-4 text-left mb-2"
              onClick={handleDownloadReport}
            >
              <Download className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span className="font-medium">Download Report</span>
                <span className="text-xs text-muted-foreground">
                  Summary of your internship
                </span>
              </div>
            </Button>
            
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
        </div>
      </div>
    </ModernCard>
  );
}
