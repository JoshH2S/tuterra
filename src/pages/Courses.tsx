import { useState } from "react";
import { useCourses } from "@/hooks/useCourses";
import { CourseList } from "@/components/courses/CourseList";
import { CreateCourseForm } from "@/components/courses/CreateCourseForm";
import { CoursesHeader } from "@/components/courses/CoursesHeader";

const Courses = () => {
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const { courses, isLoading, createCourse, handleFileUpload } = useCourses();

  const handleCreateCourse = async () => {
    if (!newCourseTitle.trim()) {
      return;
    }

    const success = await createCourse(newCourseTitle);
    if (success) {
      setNewCourseTitle("");
      setIsCreatingCourse(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CoursesHeader onCreateClick={() => setIsCreatingCourse(true)} />

      {isCreatingCourse && (
        <CreateCourseForm
          newCourseTitle={newCourseTitle}
          onTitleChange={setNewCourseTitle}
          onSubmit={handleCreateCourse}
          onCancel={() => {
            setIsCreatingCourse(false);
            setNewCourseTitle("");
          }}
        />
      )}

      {isLoading ? (
        <div className="text-center py-8">Loading courses...</div>
      ) : (
        <CourseList 
          courses={courses}
          onFileSelect={handleFileUpload}
        />
      )}
    </div>
  );
};

export default Courses;