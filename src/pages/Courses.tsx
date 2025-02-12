
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseList } from "@/components/courses/CourseList";
import { CreateCourseForm } from "@/components/courses/CreateCourseForm";
import { CoursesHeader } from "@/components/courses/CoursesHeader";
import { useCourses } from "@/hooks/useCourses";
import { CourseStateCard } from "@/components/courses/CourseStateCard";

const Courses = () => {
  const { courses, isLoading, error, createCourse, handleFileUpload, deleteCourse } = useCourses();
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

  if (error) {
    return <CourseStateCard message={error} isError={true} />;
  }

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

      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CourseStateCard message="Loading courses..." />
          ) : (
            <CourseList 
              courses={courses} 
              onFileSelect={handleFileUpload}
              onDelete={deleteCourse}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Courses;
