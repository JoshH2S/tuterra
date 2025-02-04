import { useState } from "react";
import FileUpload from "../components/FileUpload";
import { Button } from "../components/ui/button";
import { toast } from "../components/ui/use-toast";
import { PlusCircle, Book } from "lucide-react";

const Courses = () => {
  const [courses, setCourses] = useState<{ name: string; file: File }[]>([]);

  const handleFileSelect = (file: File) => {
    const newCourse = {
      name: file.name.split('.')[0], // Use filename as course name
      file: file
    };
    
    setCourses([...courses, newCourse]);
    toast({
      title: "Course material uploaded",
      description: `${file.name} has been successfully uploaded.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses</h1>
        <p className="text-gray-600">Upload and manage your course materials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Course Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Upload New Course Material</h2>
          <FileUpload 
            onFileSelect={handleFileSelect}
            acceptedTypes=".pdf,.doc,.docx"
          />
        </div>

        {/* Course List Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
          {courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Book className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No courses uploaded yet</p>
              <p className="text-sm">Upload your first course material to get started</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {courses.map((course, index) => (
                <li 
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Book className="h-5 w-5 text-primary" />
                    <span className="font-medium">{course.name}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;