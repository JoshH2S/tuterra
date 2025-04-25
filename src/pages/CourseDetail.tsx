import { useState } from "react";
import { useParams } from "react-router-dom";

const CourseDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div>Course Detail: {id}</div>
  );
};

export default CourseDetail;
