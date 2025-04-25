
import React from 'react';
import { 
  CalendarDays, Briefcase, BrainCircuit, 
  BookOpen, GraduationCap, FileText 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export const DashboardFeatures = () => {
  const features = [
    {
      title: "Course Library",
      description: "Browse our extensive library of courses across various subjects",
      icon: BookOpen,
      href: "/courses",
      color: "bg-blue-500"
    },
    {
      title: "Practice Quizzes",
      description: "Test your knowledge with interactive quizzes on different topics",
      icon: FileText,
      href: "/quizzes",
      color: "bg-green-500"
    },
    {
      title: "Job Interview Simulator",
      description: "Prepare for interviews with our AI-powered simulator",
      icon: Briefcase,
      href: "/interview-simulator",
      color: "bg-purple-500"
    },
    {
      title: "Learning Calendar",
      description: "Schedule and organize your study sessions",
      icon: CalendarDays,
      href: "/calendar",
      color: "bg-amber-500"
    },
    {
      title: "Assessments",
      description: "Evaluate your skills with comprehensive assessments",
      icon: GraduationCap,
      href: "/assessments",
      color: "bg-rose-500"
    },
    {
      title: "Skill Builder",
      description: "Focus on developing specific skills with targeted exercises",
      icon: BrainCircuit,
      href: "/skill-builder",
      color: "bg-teal-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((feature) => (
        <Card key={feature.title} className="overflow-hidden">
          <div className={`h-2 ${feature.color}`} />
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-full ${feature.color} bg-opacity-20`}>
                <feature.icon className={`h-5 w-5 text-${feature.color}`} />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link to={feature.href}>
                Explore
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-right"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
