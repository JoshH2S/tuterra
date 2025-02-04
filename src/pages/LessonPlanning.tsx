import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { CourseMaterialUpload } from "@/components/lesson-planning/CourseMaterialUpload";
import { ObjectivesCard } from "@/components/lesson-planning/ObjectivesCard";
import { LessonPlanOutput } from "@/components/lesson-planning/LessonPlanOutput";

interface Objective {
  description: string;
  days: number;
}

const MAX_CONTENT_LENGTH = 5000;

const LessonPlanning = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([{ description: "", days: 1 }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<string>("");
  const [contentLength, setContentLength] = useState<number>(0);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    const content = await file.text();
    setContentLength(content.length);
  };

  const addObjective = () => {
    setObjectives([...objectives, { description: "", days: 1 }]);
  };

  const updateObjective = (index: number, field: keyof Objective, value: string | number) => {
    const newObjectives = [...objectives];
    newObjectives[index] = {
      ...newObjectives[index],
      [field]: value
    };
    setObjectives(newObjectives);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    if (objectives.some(obj => !obj.description)) {
      toast({
        title: "Error",
        description: "Please fill out all objectives",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setLessonPlan("");

    try {
      const fileContent = await selectedFile.text();
      const trimmedContent = fileContent.slice(0, MAX_CONTENT_LENGTH);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: teacherData } = await supabase
        .from('profiles')
        .select('first_name, last_name, school')
        .eq('id', session.user.id)
        .single();

      const response = await fetch(
        'https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/generate-lesson-plan',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            content: trimmedContent,
            objectives: objectives,
            teacherName: teacherData ? `${teacherData.first_name} ${teacherData.last_name}` : undefined,
            school: teacherData?.school,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate lesson plan');
      }

      const data = await response.json();
      setLessonPlan(data.lessonPlan);

      toast({
        title: "Success",
        description: "Lesson plan generated successfully!",
      });
    } catch (error) {
      console.error('Error processing lesson plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate lesson plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Lesson Planning</h1>
          <p className="text-gray-600">Create AI-powered lesson plans from your course materials</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CourseMaterialUpload
            onFileSelect={handleFileSelect}
            contentLength={contentLength}
          />

          <ObjectivesCard
            objectives={objectives}
            onObjectiveChange={updateObjective}
            onAddObjective={addObjective}
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
            isSubmitDisabled={isProcessing || !selectedFile || objectives.some(obj => !obj.description)}
          />

          <LessonPlanOutput lessonPlan={lessonPlan} />
        </div>
      </div>
    </div>
  );
};

export default LessonPlanning;