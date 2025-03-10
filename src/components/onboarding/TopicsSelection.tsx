
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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

const NEWS_TOPICS = [
  { value: 'business_economics', label: 'Business & Economics' },
  { value: 'political_science_law', label: 'Political Science & Law' },
  { value: 'science_technology', label: 'Science & Technology' },
  { value: 'healthcare_medicine', label: 'Healthcare & Medicine' },
  { value: 'engineering_applied_sciences', label: 'Engineering & Applied Sciences' },
  { value: 'arts_humanities_social_sciences', label: 'Arts, Humanities & Social Sciences' },
  { value: 'education', label: 'Education' },
  { value: 'mathematics_statistics', label: 'Mathematics & Statistics' },
  { value: 'industry_specific', label: 'Industry-Specific Studies' },
  { value: 'cybersecurity_it', label: 'Cybersecurity & IT' },
] as const;

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
          <div key={topic.value} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
            <Checkbox
              id={`topic-${topic.value}`}
              checked={selectedTopics.includes(topic.value)}
              onCheckedChange={(checked) => handleTopicChange(topic.value, checked === true)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label 
                htmlFor={`topic-${topic.value}`}
                className="text-sm font-medium cursor-pointer"
              >
                {topic.label}
              </Label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
