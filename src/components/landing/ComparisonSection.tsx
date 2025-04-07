
"use client";

import { motion } from "framer-motion";
import { CheckCircle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const advantages = [
  "📰 Live News-Based Quiz & Case Study Generator - Stay relevant with automatically generated, course-aligned quizzes and case studies from real-time global news events—unique to Tuterra.",
  "🎤 Interview Simulator for Career Readiness - Practice real, industry-specific interview questions and receive guided feedback—not just certificates, but confidence.",
  "📊 Intelligent Analytics & Personalized Feedback - Visual dashboards show real-time performance and offer AI-powered recommendations to help users improve where it matters most.",
  "🧰 All-in-One Education-to-Employment Platform - Combines course planning, tutoring, assessments, real-world prep, and analytics—no need for multiple tools or subscriptions.",
  "💡 Student-Centered Learning Flow - Lesson plans, quizzes, and projects are generated directly from textbook content, creating personalized study tools instantly.",
  "📈 High Engagement, Real Outcomes - Gamified tracking, live scenarios, and news-driven content mean users stay engaged—and exit job-ready."
];

// Feature comparison data
const features = [
  { name: "Live News Integration", tuterra: true, coursera: false, skillshare: false, magicschool: false },
  { name: "Mobile UI", tuterra: true, coursera: true, skillshare: true, magicschool: true },
  { name: "AI-Powered Feedback", tuterra: true, coursera: "Basic-auto quizzes", skillshare: false, magicschool: "Prompt-based feedback" },
  { name: "Job Interview Prep", tuterra: true, coursera: "Rare", skillshare: false, magicschool: false },
  { name: "Career-Prep Tools", tuterra: "Strong", coursera: "Medium", skillshare: "Weak", magicschool: "Low" },
  { name: "Engagement", tuterra: "High", coursera: "Medium-High", skillshare: "High (Creative)", magicschool: "Low" },
];

// Platform data
const platforms = [
  { name: "tuterra", title: "Tuterra" },
  { name: "coursera", title: "Coursera" },
  { name: "skillshare", title: "Skillshare" },
  { name: "magicschool", title: "Magic School" },
];

export function ComparisonSection() {
  return (
    <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 gradient-text">
            Why Choose EduPortal?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            See how our modern approach outperforms traditional learning management systems
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 items-start gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden rounded-xl">
              <CardContent className="p-0 overflow-x-auto">
                <div className="w-full min-w-[768px]">
                  {/* Feature Comparison Table */}
                  <div className="w-full">
                    {/* Table Header with Platform Names */}
                    <div className="flex border-b">
                      <div className="w-1/3 py-4 px-6 font-bold text-xl text-blue-600">
                        Feature Comparison
                      </div>
                      <div className="flex w-2/3">
                        {platforms.map((platform, idx) => (
                          <div 
                            key={platform.name} 
                            className="flex-1 p-4 text-center font-semibold flex flex-col items-center justify-center"
                          >
                            <div className="w-10 h-10 mb-2 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                              {idx + 1}
                            </div>
                            <span>{platform.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Feature Rows */}
                    {features.map((feature, index) => (
                      <div 
                        key={feature.name} 
                        className={cn(
                          "flex items-stretch border-b",
                          index % 2 === 0 ? "bg-blue-50/50" : "bg-white"
                        )}
                      >
                        <div className="w-1/3 py-6 px-6 flex items-center">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                            <span className="font-medium">{feature.name}</span>
                          </div>
                        </div>
                        <div className="flex w-2/3">
                          {platforms.map((platform) => {
                            const value = feature[platform.name as keyof typeof feature];
                            return (
                              <div 
                                key={`${feature.name}-${platform.name}`} 
                                className="flex-1 p-4 text-center flex items-center justify-center"
                              >
                                {typeof value === 'boolean' ? (
                                  value ? (
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                  ) : (
                                    <X className="h-6 w-6 text-red-500" />
                                  )
                                ) : (
                                  <span className="text-sm">{value}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6"
          >
            <div>
              <h3 className="text-2xl font-bold mb-4">Educational Excellence, Reimagined</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                EduPortal consistently outperforms traditional learning management systems across all key metrics, 
                offering a more engaging, effective, and personalized educational experience.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-semibold mb-4">Key Advantages:</h4>
              <ul className="space-y-4">
                {advantages.map((advantage, index) => {
                  const [emoji, title, description] = advantage.split(' - ');
                  return (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="text-lg flex-shrink-0 mt-0.5">{emoji}</div>
                      <div>
                        <span className="font-medium text-blue-700 dark:text-blue-400">{title}</span>
                        <p className="text-gray-700 dark:text-gray-200 mt-1">{description}</p>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-blue-700 dark:text-blue-300 font-medium">
                Students using EduPortal show an average improvement of 27% in course performance compared to traditional systems.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
