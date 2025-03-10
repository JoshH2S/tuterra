
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Star, TrendingUp } from "lucide-react";

type NewsTopic = 
  | 'business_economics'
  | 'political_science_law'
  | 'science_technology'
  | 'healthcare_medicine'
  | 'engineering_applied_sciences'
  | 'arts_humanities_social_sciences'
  | 'education'
  | 'mathematics_statistics'
  | 'industry_specific'
  | 'cybersecurity_it';

interface NewsTopicItem {
  value: NewsTopic;
  label: string;
  description: string;
  popular?: boolean;
  trending?: boolean;
}

const NEWS_TOPICS: NewsTopicItem[] = [
  { 
    value: 'business_economics', 
    label: 'Business & Economics',
    popular: true,
    description: 'Finance, markets, entrepreneurship' 
  },
  { 
    value: 'political_science_law', 
    label: 'Political Science & Law',
    description: 'Government, policy, legal studies' 
  },
  { 
    value: 'science_technology', 
    label: 'Science & Technology',
    popular: true,
    description: 'Physics, biology, computer science' 
  },
  { 
    value: 'healthcare_medicine', 
    label: 'Healthcare & Medicine',
    popular: true,
    description: 'Medical research, healthcare systems' 
  },
  { 
    value: 'engineering_applied_sciences', 
    label: 'Engineering & Applied Sciences',
    description: 'Mechanical, electrical, civil engineering' 
  },
  { 
    value: 'arts_humanities_social_sciences', 
    label: 'Arts & Humanities',
    description: 'Literature, history, philosophy, social sciences' 
  },
  { 
    value: 'education', 
    label: 'Education',
    description: 'Teaching methods, educational policy' 
  },
  { 
    value: 'mathematics_statistics', 
    label: 'Mathematics & Statistics',
    description: 'Pure math, statistics, data analysis' 
  },
  { 
    value: 'industry_specific', 
    label: 'Industry Studies',
    description: 'Specialized industry research and trends' 
  },
  { 
    value: 'cybersecurity_it', 
    label: 'Cybersecurity & IT',
    trending: true,
    description: 'Network security, information technology' 
  },
];

interface TopicsSelectionProps {
  selectedTopics: string[];
  setSelectedTopics: (topics: string[]) => void;
}

export const TopicsSelection = ({ selectedTopics, setSelectedTopics }: TopicsSelectionProps) => {
  const handleTopicChange = (topicValue: string, checked: boolean) => {
    if (checked) {
      setSelectedTopics([...selectedTopics, topicValue]);
    } else {
      setSelectedTopics(selectedTopics.filter(t => t !== topicValue));
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="grid grid-cols-1 gap-y-3 gap-x-4 sm:grid-cols-2">
        {NEWS_TOPICS.map((topic) => (
          <motion.div 
            key={topic.value} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex flex-col p-4 rounded-lg border ${
              selectedTopics.includes(topic.value) 
                ? 'border-primary bg-primary/5 shadow-sm' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            } transition-all touch-manipulation`}
          >
            <div className="flex items-start space-x-3">
              <Checkbox
                id={`topic-${topic.value}`}
                checked={selectedTopics.includes(topic.value)}
                onCheckedChange={(checked) => handleTopicChange(topic.value, checked === true)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label 
                    htmlFor={`topic-${topic.value}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {topic.label}
                  </Label>
                  
                  {topic.popular && (
                    <div className="flex items-center text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </div>
                  )}
                  
                  {topic.trending && (
                    <div className="flex items-center text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{topic.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {selectedTopics.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center mt-6 p-3 bg-primary/10 rounded-lg"
        >
          <span className="text-sm font-medium">
            {selectedTopics.length} {selectedTopics.length === 1 ? 'topic' : 'topics'} selected
          </span>
        </motion.div>
      )}
    </div>
  );
};
