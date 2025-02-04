import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import FileUpload from "@/components/FileUpload";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { ObjectiveInput } from "@/components/lesson-planning/ObjectiveInput";
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
    
    if (content.length > MAX_CONTENT_LENGTH) {
      toast({
        title: "Content will be trimmed",
        description: `Your file content (${content.length} characters) exceeds the limit of ${MAX_CONTENT_LENGTH} characters. Only the first ${MAX_CONTENT_LENGTH} characters will be processed.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "File selected",
        description: `${file.name} has been selected for lesson planning.`,
      });
    }
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
          <Card>
            <CardHeader>
              <CardTitle>Course Material</CardTitle>
              <CardDescription>Upload a new file or select from existing courses</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={handleFileSelect}
                acceptedTypes=".pdf,.doc,.docx,.txt"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Objectives</CardTitle>
              <CardDescription>Define learning objectives and their duration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {objectives.map((objective, index) => (
                <ObjectiveInput
                  key={index}
                  objective={objective}
                  index={index}
                  onChange={updateObjective}
                />
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addObjective}
                className="w-full"
              >
                Add Another Objective
              </Button>

              <Button
                type="button"
                onClick={handleSubmit}
                className="w-full"
                disabled={isProcessing || !selectedFile || objectives.some(obj => !obj.description)}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Lesson Plan...
                  </>
                ) : (
                  'Generate Lesson Plan'
                )}
              </Button>
            </CardContent>
          </Card>

          <LessonPlanOutput lessonPlan={lessonPlan} />
        </div>
      </div>
    </div>
  );
};

export default LessonPlanning;