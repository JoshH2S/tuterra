
import { ModernCard } from "@/components/ui/modern-card";
import { InternshipResource } from "./SwipeableInternshipView";
import { ExternalLink, FileText, Video, BookOpen } from "lucide-react";

interface ResourceHubProps {
  resources: InternshipResource[];
}

export function ResourceHub({ resources }: ResourceHubProps) {
  const getResourceIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'tutorial':
        return <BookOpen className="h-5 w-5" />;
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };
  
  // Transform resources into cards for display
  const resourceCards = resources.map(resource => ({
    id: resource.id,
    title: resource.title,
    description: resource.link.startsWith('http') ? new URL(resource.link).hostname : resource.link,
    icon: getResourceIcon(resource.type),
    type: resource.type,
    link: resource.link
  }));

  // Create mock recommended content for demonstration
  const recommendedContent = [
    {
      id: '1',
      title: '7 Marketing Trends for 2025',
      type: 'Article',
      time: '5 min read'
    },
    {
      id: '2',
      title: 'Introduction to Market Segmentation',
      type: 'Video',
      time: '12 min watch'
    }
  ];

  return (
    <ModernCard>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Resource Hub</h2>
        
        {resourceCards.length === 0 ? (
          <div className="text-center py-6 mb-5">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <h3 className="font-medium">No Resources Available</h3>
            <p className="text-sm text-muted-foreground">
              Learning resources will be added here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {resourceCards.map((resource) => (
              <a
                key={resource.id}
                href={resource.link.startsWith('http') ? resource.link : '#'}
                target={resource.link.startsWith('http') ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-left flex gap-3 hover:border-primary transition-colors hover:shadow-sm touch-manipulation"
              >
                <div className="text-2xl">{resource.icon}</div>
                <div>
                  <h3 className="font-medium text-sm">{resource.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {resource.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
        
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
