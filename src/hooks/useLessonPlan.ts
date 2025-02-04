import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Objective {
  description: string;
  days: number;
}

export const MAX_CONTENT_LENGTH = 5000;

export const useLessonPlan = () => {
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

  return {
    selectedFile,
    objectives,
    isProcessing,
    lessonPlan,
    contentLength,
    handleFileSelect,
    addObjective,
    updateObjective,
    handleSubmit,
  };
};