
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateCourseForm } from "@/components/courses/CreateCourseForm";
import { CoursesHeader } from "@/components/courses/CoursesHeader";
import { useCourses } from "@/hooks/useCourses";
import { CourseCard } from "@/components/courses/CourseCard";

const Courses = () => {
  const { createCourse, courses, isLoading } = useCourses();
  const [isCreating, setIsCreating] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleSubmit = async () => {
    const success = await createCourse(newCourseTitle);
    if (success) {
      setNewCourseTitle("");
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setNewCourseTitle("");
    setIsCreating(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <CoursesHeader onCreateClick={handleCreateClick} />
      
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Course</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateCourseForm 
              newCourseTitle={newCourseTitle}
              onTitleChange={setNewCourseTitle}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center">Loading courses...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
