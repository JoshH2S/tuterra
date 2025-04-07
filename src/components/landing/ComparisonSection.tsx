
"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const platforms = [
  {
    name: "Tuterra",
    logo: "/lovable-uploads/5abc5bdf-f0f2-4773-844c-b174f2e2b884.png",
    logoAlt: "Tuterra Logo"
  },
  {
    name: "Coursera",
    logo: "/lovable-uploads/cfcdbcb8-21ea-4d0f-beae-4368ad873520.png",
    logoAlt: "Coursera Logo"
  },
  {
    name: "Skillshare",
    logo: "/lovable-uploads/c74dcaa0-03f0-4ace-83cb-ad0b944f15dd.png",
    logoAlt: "Skillshare Logo"
  },
  {
    name: "Magic School",
    logo: "/lovable-uploads/9c384236-998d-4be7-8fce-38625409b005.png",
    logoAlt: "Magic School Logo"
  }
];

const features = [
  {
    name: "Live News Integration",
    values: [true, false, false, false]
  },
  {
    name: "Mobile UI",
    values: [true, true, true, true]
  },
  {
    name: "AI-Powered Feedback",
    values: [true, "Basic-auto quizzes", false, "Prompt-based feedback"]
  },
  {
    name: "Job Interview Prep",
    values: [true, "Rare", false, false]
  },
  {
    name: "Career-Prep Tools",
    values: ["Strong", "Medium", "Weak", "Low"]
  },
  {
    name: "Engagement",
    values: ["High", "Medium-High", "High (Creative)", "Low"]
  }
];

const advantages = [
  {
    title: "AI-Powered Learning Content",
    description: "AI-generated quizzes and case studies powered by real-time news for industry-aligned learning"
  },
  {
    title: "Interview Preparation",
    description: "Interactive interview simulator with role-specific questions and real-time feedback to boost confidence"
  },
  {
    title: "Performance Analytics",
    description: "Dynamic analytics dashboard with personalized performance insights and improvement pathways"
  },
  {
    title: "All-in-One Platform",
    description: "Comprehensive all-in-one platform covering learning, tutoring, assessments, and career readiness"
  },
  {
    title: "Content Transformation",
    description: "Textbook-to-tool pipeline that instantly converts content into customized lessons, quizzes, and projects"
  },
  {
    title: "Engaging Learning Experience",
    description: "Gamified learning experiences and real-world scenarios proven to drive higher engagement and career readiness"
  }
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
            Feature Comparison
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            See how our modern approach outperforms traditional learning management systems
          </p>
        </motion.div>

        {/* Comparison Chart - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <div className="w-full overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <div className="min-w-[768px]">
              {/* Platform Headers - Logos Only */}
              <div className="grid comparison-grid gap-4 mb-6">
                <div /> {/* Empty space for feature names */}
                {platforms.map((platform, index) => (
                  <div 
                    key={index}
                    className="rounded-t-2xl bg-blue-100/80 dark:bg-blue-900/20 p-6 text-center"
                  >
                    <img
                      src={platform.logo}
                      alt={platform.logoAlt}
                      className="mx-auto h-10 object-contain"
                    />
                  </div>
                ))}
              </div>

              {/* Feature Rows */}
              {features.map((feature, index) => (
                <div 
                  key={feature.name}
                  className="grid comparison-grid gap-4 mb-4"
                >
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
                    <span className="font-medium">{feature.name}</span>
                  </div>
                  {feature.values.map((value, i) => (
                    <div 
                      key={i}
                      className="bg-blue-100/50 dark:bg-blue-900/10 p-4 flex items-center justify-center text-center feature-cell"
                    >
                      {typeof value === 'boolean' ? (
                        value ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )
                      ) : (
                        <span className="text-sm">{value}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Key Advantages Section - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="text-2xl font-bold mb-8 text-center">Key Advantages</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start gap-4 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {advantage.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {advantage.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
