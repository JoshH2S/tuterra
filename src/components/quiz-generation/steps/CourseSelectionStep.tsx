
import React from "react";
import { RadioGroup } from "@/components/ui/radio-group";
import { 
  Book, 
  GraduationCap, 
  School, 
  Trophy, 
  Brain 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioCard } from "../RadioCard";
import { useCourses } from "@/hooks/useCourses";
import { motion } from "framer-motion";
import { QuestionDifficulty } from "@/types/quiz";

interface CourseSelectionStepProps {
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  difficulty: QuestionDifficulty;
  setDifficulty: (difficulty: QuestionDifficulty) => void;
}

export const CourseSelectionStep = ({
  selectedCourseId,
  setSelectedCourseId,
  difficulty,
  setDifficulty,
}: CourseSelectionStepProps) => {
  const { courses, isLoading } = useCourses();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select a Course</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose the course you want to create a quiz for
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="w-full h-[72px] animate-pulse">
              <CardContent className="p-0 h-full bg-gray-200 dark:bg-gray-700" />
            </Card>
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <RadioGroup
            value={selectedCourseId}
            onValueChange={setSelectedCourseId}
            className="space-y-3"
          >
            {courses.map((course) => (
              <motion.div key={course.id} variants={item}>
                <RadioCard
                  value={course.id}
                  icon={Book}
                  label={course.title}
                  description={course.description}
                />
              </motion.div>
            ))}
          </RadioGroup>
        </motion.div>
      )}

      <div className="pt-6">
        <h3 className="text-xl font-bold mb-4">Education Level</h3>
        <RadioGroup
          value={difficulty}
          onValueChange={(value) => setDifficulty(value as QuestionDifficulty)}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <RadioCard
            value="middle_school"
            icon={School}
            label="Middle School"
          />
          <RadioCard
            value="high_school"
            icon={GraduationCap}
            label="High School"
          />
          <RadioCard
            value="university"
            icon={Trophy}
            label="University"
          />
          <RadioCard
            value="post_graduate"
            icon={Brain}
            label="Post Graduate"
          />
        </RadioGroup>
      </div>
    </div>
  );
};
