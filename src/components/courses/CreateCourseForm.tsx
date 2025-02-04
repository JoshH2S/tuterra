import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateCourseFormProps {
  newCourseTitle: string;
  onTitleChange: (title: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const CreateCourseForm = ({
  newCourseTitle,
  onTitleChange,
  onSubmit,
  onCancel,
}: CreateCourseFormProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
      <div className="flex gap-4">
        <Input
          placeholder="Enter course title"
          value={newCourseTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          className="flex-1"
        />
        <Button onClick={onSubmit}>
          Create Course
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};