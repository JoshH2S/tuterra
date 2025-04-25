
import { useState } from "react";
import { useParams } from "react-router-dom";

const CourseDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Course Details</h1>
      <div className="flex gap-4 mb-6 border-b">
        <button
          className={`px-4 py-2 ${activeTab === "overview" ? "border-b-2 border-primary font-medium" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "content" ? "border-b-2 border-primary font-medium" : ""}`}
          onClick={() => setActiveTab("content")}
        >
          Content
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "grades" ? "border-b-2 border-primary font-medium" : ""}`}
          onClick={() => setActiveTab("grades")}
        >
          Grades
        </button>
      </div>

      <div className="bg-card p-6 rounded-lg shadow">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Course Overview</h2>
            <p>Course ID: {id}</p>
            <p className="mt-4 text-muted-foreground">
              This page is under development. More course details will be available soon.
            </p>
          </div>
        )}
        
        {activeTab === "content" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Course Content</h2>
            <p className="text-muted-foreground">
              Course content will be listed here.
            </p>
          </div>
        )}
        
        {activeTab === "grades" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Course Grades</h2>
            <p className="text-muted-foreground">
              Your grades and assessments will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
