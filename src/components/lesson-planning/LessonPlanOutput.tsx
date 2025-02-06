import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

interface LessonPlanOutputProps {
  lessonPlan: string;
}

interface TeacherInfo {
  first_name: string;
  last_name: string;
  school: string;
}

export const LessonPlanOutput = ({ lessonPlan }: LessonPlanOutputProps) => {
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, school')
          .eq('id', session.user.id)
          .single();

        if (!error && data) {
          setTeacherInfo(data);
        }
      }
    };

    fetchTeacherInfo();
  }, []);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;

    // Set initial font sizes
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Lesson Plan", margin, yPosition);
    yPosition += lineHeight * 2;

    // Add header with teacher information
    if (teacherInfo) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Teacher: ${teacherInfo.first_name} ${teacherInfo.last_name}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`School: ${teacherInfo.school}`, margin, yPosition);
      yPosition += lineHeight * 2;
    }

    // Add lesson plan content with proper text wrapping and pagination
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    // Split text into lines that fit within the page width
    const textLines = doc.splitTextToSize(lessonPlan, pageWidth - (margin * 2));

    // Add lines to pages
    textLines.forEach((line: string) => {
      // Check if we need a new page
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    // Save the PDF
    doc.save('lesson-plan.pdf');
  };

  if (!lessonPlan) return null;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Generated Lesson Plan</CardTitle>
        <CardDescription>AI-generated lesson plan based on your content and objectives</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teacherInfo && (
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Teacher: {teacherInfo.first_name} {teacherInfo.last_name}</p>
              <p>School: {teacherInfo.school}</p>
            </div>
          )}
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans">{lessonPlan}</pre>
          </div>
          <Button 
            onClick={handleDownloadPDF}
            className="mt-4"
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};