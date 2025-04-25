
import { FeatureShowcase } from "./FeatureShowcase";

export function FeatureShowcaseDemo() {
  const features = [
    {
      title: "Interactive Dashboard",
      description: "Our intuitive dashboard provides a comprehensive overview of your learning journey, with real-time progress tracking and personalized recommendations.",
      image: "/lovable-uploads/66e5de1b-be24-4178-944a-09183d99629d.png",
      buttonText: "Explore Dashboard",
    },
    {
      title: "Case Study Quizzes",
      description: "Create course and topic specific quizzes that move you beyond knowledge absorption into applying concepts into the world areound you, tailored to recent real-world events! ",
      image: "/lovable-uploads/089c8cb1-63b0-4ed5-ba8c-419af66cdf7e.png",
      buttonText: "Start Assessment",
    },
    {
      title: "Job Interview Simulator",
      description: "Practice your interview skills with our AI-powered simulator, featuring realistic scenarios and instant feedback on your responses.",
      image: "/lovable-uploads/3df6641b-fd5a-4272-9c39-6ee0258337db.png",
      buttonText: "Start Interview",
    },
    {
      title: "Skill Assessments",
      description: "Evaluate your skills with our comprehensive assessment tools, featuring detailed feedback and personalized improvement suggestions.",
      image: "/lovable-uploads/a02bdab0-bfea-438f-9680-b4e948ed841a.png",
      buttonText: "Start Learning",
    },
  ];

  return <FeatureShowcase features={features} />;
}
