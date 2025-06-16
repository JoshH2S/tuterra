import { useNavigate } from "react-router-dom";

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
}

function FeatureCard({ title, description, href }: FeatureCardProps) {
  const navigate = useNavigate();
  
  return (
    <div 
      onClick={() => navigate(href)}
      className="bg-gradient-to-br from-primary-100/80 to-primary-200/80 rounded-2xl p-6 text-left hover:scale-[1.02] transition-all duration-300 ease-in-out shadow-md hover:shadow-xl cursor-pointer"
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-800/80 dark:text-gray-100/80">{description}</p>
    </div>
  );
}

export function FeatureCards() {
  const features = [
    {
      title: "Courses",
      description: "Create and view your courses here",
      href: "/courses"
    },
    {
      title: "Case Study Quiz",
      description: "Apply your knowledge to real-world news events",
      href: "/quizzes/case-study-quiz"
    },
    {
      title: "Skill Assessments",
      description: "Test your skill set against what employers expect",
      href: "/assessments"
    },
    {
      title: "Job Interview Simulator",
      description: "Prepare yourself for your next job interview!",
      href: "/assessments/job-interview-simulator"
    },
    {
      title: "Virtual Internship",
      description: "Run through a specialized 1–3 month AI-powered internship",
      href: "/dashboard/virtual-internship"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 mb-10 px-4 lg:px-6">
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          title={feature.title}
          description={feature.description}
          href={feature.href}
        />
      ))}
    </div>
  );
} 