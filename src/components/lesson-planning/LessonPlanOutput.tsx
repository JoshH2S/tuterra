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
    const lineHeight = 7;
    let yPosition = 20;

    // Add header with teacher information
    if (teacherInfo) {
      doc.setFontSize(12);
      doc.text(`Teacher: ${teacherInfo.first_name} ${teacherInfo.last_name}`, 20, yPosition);
      yPosition += lineHeight;
      doc.text(`School: ${teacherInfo.school}`, 20, yPosition);
      yPosition += lineHeight * 2;
    }

    // Add lesson plan content
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(lessonPlan, 170);
    doc.text(splitText, 20, yPosition);

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
