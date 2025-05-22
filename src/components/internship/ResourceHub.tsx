
import { ModernCard } from "@/components/ui/modern-card";

// Mock resources
const resources = [
  {
    id: 1,
    title: "Company Information",
    description: "Learn about NovaTech's history, values, and organizational structure",
    icon: "📋"
  },
  {
    id: 2,
    title: "Onboarding Documents",
    description: "Essential documents and forms for new interns",
    icon: "📁"
  },
  {
    id: 3,
    title: "Tools Glossary",
    description: "Guide to all software tools used at NovaTech",
    icon: "🔧"
  },
  {
    id: 4,
    title: "Style Guide",
    description: "Brand style guidelines and templates",
    icon: "🎨"
  },
];

// Mock recommended content
const recommendedContent = [
  {
    id: 1,
    title: "7 Marketing Trends for 2025",
    type: "Article",
    time: "5 min read"
  },
  {
    id: 2,
    title: "Introduction to Market Segmentation",
    type: "Video",
    time: "12 min watch"
  },
];

export function ResourceHub() {
  return (
    <ModernCard>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Resource Hub</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {resources.map((resource) => (
            <button 
              key={resource.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-left flex gap-3 hover:border-primary transition-colors hover:shadow-sm touch-manipulation"
            >
              <div className="text-2xl">{resource.icon}</div>
              <div>
                <h3 className="font-medium text-sm">{resource.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {resource.description}
                </p>
              </div>
            </button>
          ))}
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-3">Recommended for You</h3>
          <div className="space-y-2">
            {recommendedContent.map((content) => (
              <button 
                key={content.id}
                className="w-full flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
              >
                <div className="text-sm">{content.title}</div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-primary font-medium">{content.type}</span>
                  <span className="text-xs text-gray-500">{content.time}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ModernCard>
  );
}
