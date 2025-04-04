
import { CourseTemplates } from "@/components/courses/CourseTemplates";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Save } from "lucide-react";

interface LessonPlanningHeaderWithTemplatesProps {
  onSaveTemplate?: () => void;
}

export const LessonPlanningHeaderWithTemplates = ({ onSaveTemplate }: LessonPlanningHeaderWithTemplatesProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 gradient-text">AI Lesson Planning</h1>
          <p className="text-gray-600">Create AI-powered lesson plans from your course materials</p>
        </div>
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Load Template</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <CourseTemplates />
            </DialogContent>
          </Dialog>
          {onSaveTemplate && (
            <Button onClick={onSaveTemplate} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save as Template
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
