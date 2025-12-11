import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  isLarge?: boolean;
  illustration?: string;
  ctaText?: string;
}

function FeatureCard({ 
  title, 
  description, 
  href, 
  isLarge = false,
  illustration,
  ctaText = "Start"
}: FeatureCardProps) {
  const navigate = useNavigate();
  
  return (
    <div 
      onClick={() => navigate(href)}
      className={`relative bg-gradient-to-br from-primary-100/80 to-primary-200/80 rounded-2xl text-left hover:scale-[1.02] transition-all duration-300 ease-in-out shadow-md hover:shadow-xl cursor-pointer flex flex-col ${
        isLarge 
          ? 'p-5 sm:p-6 md:p-6 min-h-[100px] sm:min-h-[120px] md:min-h-[140px]' 
          : 'p-4 sm:p-5 md:p-6 aspect-square md:aspect-auto md:min-h-[160px]'
      }`}
    >
      {/* Micro Illustration — Desktop Only */}
      {illustration && (
        <img 
          src={illustration}
          alt=""
          className="hidden md:block absolute top-4 right-4 w-14 lg:w-16 opacity-25 pointer-events-none select-none text-gray-700"
        />
      )}

      {/* Content */}
      <div className="flex-1">
        <h3 className={`font-semibold mb-1.5 sm:mb-2 leading-tight ${
          isLarge ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
        }`}>{title}</h3>
        <p className={`text-gray-800/80 dark:text-gray-100/80 leading-snug md:pr-12 ${
          isLarge ? 'text-sm' : 'text-xs sm:text-sm'
        }`}>{description}</p>
      </div>

      {/* CTA — Desktop Only */}
      <div className="hidden md:flex justify-end mt-auto pt-3">
        <span className="text-sm font-medium text-primary-700 dark:text-primary-400 hover:underline flex items-center gap-1 group">
          {ctaText}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
}

export function FeatureCards() {
  const features = [
    {
      title: "Courses",
      description: "Create and view your courses here",
      href: "/courses",
      illustration: "/micro/courses.svg",
      ctaText: "View Courses"
    },
    {
      title: "Case Study Quiz",
      description: "Apply your knowledge to real-world news events",
      href: "/quizzes/case-study-quiz",
      illustration: "/micro/quiz.svg",
      ctaText: "Take Quiz"
    },
    {
      title: "Skill Assessments",
      description: "Test your skill set against what employers expect",
      href: "/assessments",
      illustration: "/micro/skills.svg",
      ctaText: "Assess Skills"
    },
    {
      title: "Job Interview Simulator",
      description: "Prepare yourself for your next job interview!",
      href: "/assessments/job-interview-simulator",
      illustration: "/micro/interview.svg",
      ctaText: "Practice"
    },
    {
      title: "Virtual Internship",
      description: "Run through a specialized 1–3 month AI-powered internship",
      href: "/dashboard/virtual-internship",
      illustration: "/micro/internship.svg",
      ctaText: "Start Internship"
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
          illustration={features[0].illustration}
          ctaText={features[0].ctaText}
          isLarge={true}
        />
      </div>
      
      {/* Remaining 4 cards in 2x2 grid on mobile, flexible on desktop */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
        {features.slice(1).map((feature, index) => (
          <FeatureCard
            key={index + 1}
            title={feature.title}
            description={feature.description}
            href={feature.href}
            illustration={feature.illustration}
            ctaText={feature.ctaText}
            isLarge={false}
          />
        ))}
      </div>
    </div>
  );
}