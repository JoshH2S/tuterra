import { useState, useEffect } from "react";
import { ModernCard } from "@/components/ui/modern-card";
import { InternshipResource } from "./SwipeableInternshipView";
import { FileText, Video, BookOpen, Building, User, Wrench, FolderOpen } from "lucide-react";
import { CompanyDetails } from "./CompanyDetails";
import { ResourceDocument } from "./ResourceDocument";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResourceHubProps {
  resources: InternshipResource[];
  sessionId: string;
}

export function ResourceHub({ resources, sessionId }: ResourceHubProps) {
  const [selectedResource, setSelectedResource] = useState<InternshipResource | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const getResourceIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'tutorial':
        return <BookOpen className="h-5 w-5" />;
      case 'company_info':
        return <Building className="h-5 w-5" />;
      case 'onboarding':
        return <User className="h-5 w-5" />;
      case 'tools':
        return <Wrench className="h-5 w-5" />;
      default:
        return <FolderOpen className="h-5 w-5" />;
    }
  };
  
  // Filter resources by category
  const filteredResources = selectedCategory === "all" 
    ? resources 
    : resources.filter(r => r.type.toLowerCase() === selectedCategory.toLowerCase());
  
  // Group resources by type for the display
  const resourcesByType: Record<string, InternshipResource[]> = {};
  
  resources.forEach(resource => {
    const type = resource.type.toLowerCase();
    if (!resourcesByType[type]) {
      resourcesByType[type] = [];
    }
    resourcesByType[type].push(resource);
  });
  
  // Map types to user-friendly labels
  const typeLabels: Record<string, string> = {
    'company_info': 'Company Information',
    'onboarding': 'Onboarding Documents',
    'tools': 'Tools Glossary',
    'article': 'Articles',
    'video': 'Videos',
    'tutorial': 'Tutorials'
  };
  
  // If a resource is selected, show its content
  if (selectedResource) {
    return (
      <ResourceDocument 
        resource={selectedResource} 
        onBack={() => setSelectedResource(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Company Details */}
        <div className="md:w-1/2">
          <h2 className="text-xl font-semibold mb-4">Company Information</h2>
          <CompanyDetails sessionId={sessionId} />
        </div>
        
        {/* Resource Categories */}
        <div className="md:w-1/2">
          <h2 className="text-xl font-semibold mb-4">Resource Hub</h2>
          
          <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="company_info">Company</TabsTrigger>
              <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {Object.entries(resourcesByType).map(([type, items]) => (
                <div key={type} className="mb-6">
                  <h3 className="text-sm font-medium mb-3 flex items-center">
                    {getResourceIcon(type)}
                    <span className="ml-2">{typeLabels[type] || type}</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {items.map(resource => (
                      <button
                        key={resource.id}
                        onClick={() => setSelectedResource(resource)}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-left flex gap-3 hover:border-primary transition-colors hover:shadow-sm touch-manipulation w-full"
                      >
                        <div>{getResourceIcon(resource.type)}</div>
                        <div>
                          <h3 className="font-medium text-sm">{resource.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {resource.description || "View resource"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
            
            {Object.keys(resourcesByType).map(type => (
              <TabsContent key={type} value={type} className="mt-0">
                <div className="grid grid-cols-1 gap-2">
                  {resourcesByType[type]?.map(resource => (
                    <button
                      key={resource.id}
                      onClick={() => setSelectedResource(resource)}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-left flex gap-3 hover:border-primary transition-colors hover:shadow-sm touch-manipulation w-full"
                    >
                      <div>{getResourceIcon(resource.type)}</div>
                      <div>
                        <h3 className="font-medium text-sm">{resource.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {resource.description || "View resource"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
