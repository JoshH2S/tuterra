
"use client";

import { motion } from "framer-motion";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const comparisonData = [
  { category: "Assignments", traditional: 65, eduportal: 92 },
  { category: "Quizzes", traditional: 72, eduportal: 88 },
  { category: "Engagement", traditional: 58, eduportal: 95 },
  { category: "Progress", traditional: 70, eduportal: 90 },
  { category: "Feedback", traditional: 62, eduportal: 94 }
];

const chartConfig = {
  traditional: {
    label: "Traditional LMS",
    color: "url(#traditionalGradient)"
  },
  eduportal: {
    label: "EduPortal",
    color: "url(#eduportalGradient)"
  }
};

const advantages = [
  "Interactive learning experiences with 37% higher engagement rates",
  "Personalized feedback system that adapts to individual learning styles",
  "Real-time progress tracking with actionable insights",
  "Seamless integration with existing educational tools and platforms",
  "AI-powered recommendations based on learning patterns and preferences"
];

export function ComparisonSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4 gradient-text">
            Why Choose EduPortal?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            See how our modern approach outperforms traditional learning management systems
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 items-center gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-0">
                <CardTitle className="text-2xl font-bold">Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[300px] w-full">
                  <ChartContainer
                    config={chartConfig}
                    className="h-full w-full"
                  >
                    <BarChart
                      data={comparisonData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                    >
                      <defs>
                        <linearGradient id="eduportalGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#091747" />
                          <stop offset="100%" stopColor="var(--chart-gradient-end)" />
                        </linearGradient>
                        <linearGradient id="traditionalGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#091747" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="var(--chart-gradient-end)" stopOpacity="0.6" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                      <XAxis 
                        dataKey="category" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'var(--color-foreground, currentColor)', opacity: 0.8 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: 'var(--color-foreground, currentColor)', opacity: 0.6 }}
                        dx={-10}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                      />
                      <Bar 
                        dataKey="traditional" 
                        fill="url(#traditionalGradient)" 
                        name="Traditional LMS" 
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                      <Bar 
                        dataKey="eduportal" 
                        fill="url(#eduportalGradient)" 
                        name="EduPortal" 
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ChartContainer>
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
              <ul className="space-y-3">
                {advantages.map((advantage, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">{advantage}</span>
                  </motion.li>
                ))}
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
