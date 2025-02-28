
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCourses } from "@/hooks/useCourses";
import { QuestionDifficulty } from "@/types/quiz";

interface CourseSelectionProps {
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  difficulty: QuestionDifficulty;
  setDifficulty: (difficulty: QuestionDifficulty) => void;
}

export const CourseSelection = ({ 
  selectedCourseId, 
  setSelectedCourseId, 
  difficulty, 
  setDifficulty 
}: CourseSelectionProps) => {
  const { courses, isLoading: isLoadingCourses } = useCourses();

  return (
    <>
      <div className="space-y-2">
        <label htmlFor="course" className="text-sm font-medium">Select Course</label>
        <Select
          value={selectedCourseId}
          onValueChange={setSelectedCourseId}
          disabled={isLoadingCourses}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="difficulty" className="text-sm font-medium">Education Level</label>
        <Select
          value={difficulty}
          onValueChange={(value: QuestionDifficulty) => setDifficulty(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select education level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="middle_school">Middle School</SelectItem>
            <SelectItem value="high_school">High School</SelectItem>
            <SelectItem value="university">University</SelectItem>
            <SelectItem value="post_graduate">Post Graduate</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
