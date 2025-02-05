import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseList } from "@/components/courses/CourseList";
import { CreateCourseForm } from "@/components/courses/CreateCourseForm";
import { CoursesHeader } from "@/components/courses/CoursesHeader";
import { useCourses } from "@/hooks/useCourses";

const Courses = () => {
  const { courses, isLoading, createCourse, handleFileUpload, deleteCourse } = useCourses();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <CoursesHeader />
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateCourseForm onSubmit={createCourse} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading courses...</div>
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