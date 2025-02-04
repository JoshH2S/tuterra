import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FileUpload from "@/components/FileUpload";
import { toast } from "@/components/ui/use-toast";
import { Book, Upload, Clock, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";

interface Objective {
  description: string;
  days: number;
}

const LessonPlanning = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([{ description: "", days: 1 }]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    toast({
      title: "File selected",
      description: `${file.name} has been selected for lesson planning.`,
    });
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

    try {
      // Read the file content
      const fileContent = await selectedFile.text();
      
      // Prepare the prompt for AI processing
      const prompt = `
        Please create a detailed lesson plan based on the following content and objectives:

        Content:
        ${fileContent.substring(0, 1000)}... // Truncated for API limits

        Objectives:
        ${objectives.map((obj, index) => 
          `${index + 1}. ${obj.description} (${obj.days} days)`
        ).join('\n')}

        Please provide:
        1. A structured lesson plan
        2. Key learning outcomes
        3. Suggested activities
        4. Assessment methods
      `;

      // Here we would make the API call to OpenAI or another AI service
      // For now, we'll simulate the AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Success",
        description: "Lesson plan generated successfully! (Demo mode)",
      });

      // Here you would typically save the generated lesson plan
      // and navigate to a view page
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
                <div key={index} className="space-y-4">
                  <div>
                    <Label>Objective {index + 1}</Label>
                    <Input
                      placeholder="Enter learning objective"
                      value={objective.description}
                      onChange={(e) => updateObjective(index, "description", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Days to Complete</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={objective.days}
                        onChange={(e) => updateObjective(index, "days", parseInt(e.target.value))}
                        className="w-24"
                      />
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </div>
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
        </div>
      </div>
    </div>
  );
};

export default LessonPlanning;