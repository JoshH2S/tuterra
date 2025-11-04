import { useNavigate } from "react-router-dom";

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  isLarge?: boolean;
}

function FeatureCard({ title, description, href, isLarge = false }: FeatureCardProps) {
  const navigate = useNavigate();
  
  return (
    <div 
      onClick={() => navigate(href)}
      className={`bg-gradient-to-br from-primary-100/80 to-primary-200/80 rounded-2xl text-left hover:scale-[1.02] transition-all duration-300 ease-in-out shadow-md hover:shadow-xl cursor-pointer flex flex-col justify-center ${
        isLarge 
          ? 'p-5 sm:p-6 min-h-[100px] sm:min-h-[120px]' 
          : 'p-4 sm:p-5 aspect-square'
      }`}
    >
      <h3 className={`font-semibold mb-1.5 sm:mb-2 leading-tight ${
        isLarge ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
      }`}>{title}</h3>
      <p className={`text-gray-800/80 dark:text-gray-100/80 leading-snug ${
        isLarge ? 'text-sm' : 'text-xs sm:text-sm'
      }`}>{description}</p>
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
    <div className="mt-4 mb-8 px-4 lg:px-6 space-y-4">
      {/* First card - full width */}
      <div className="w-full">
        <FeatureCard
          title={features[0].title}
          description={features[0].description}
          href={features[0].href}
          isLarge={true}
        />
      </div>
      
      {/* Remaining 4 cards in 2x2 grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {features.slice(1).map((feature, index) => (
          <FeatureCard
            key={index + 1}
            title={feature.title}
            description={feature.description}
            href={feature.href}
            isLarge={false}
          />
        ))}
      </div>
    </div>
  );
} 