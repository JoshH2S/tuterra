
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase } from "lucide-react";

interface MobileInternshipHeaderProps {
  selectedView: string;
  setSelectedView: (view: string) => void;
  jobTitle?: string;
}

export function MobileInternshipHeader({ 
  selectedView, 
  setSelectedView,
  jobTitle = "Virtual Internship" 
}: MobileInternshipHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold truncate">{jobTitle}</h1>
      </div>
      
      <div className="relative overflow-x-auto -mx-4 px-4">
        <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
          <TabsList className="w-full overflow-x-auto flex flex-nowrap justify-start px-0 py-0 h-10 bg-transparent gap-1 touch-manipulation">
            <TabsTrigger 
              value="overview" 
              className="px-3 py-1.5 whitespace-nowrap text-sm h-8"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="px-3 py-1.5 whitespace-nowrap text-sm h-8"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger 
              value="messages" 
              className="px-3 py-1.5 whitespace-nowrap text-sm h-8"
            >
              Messages
            </TabsTrigger>
            <TabsTrigger 
              value="feedback" 
              className="px-3 py-1.5 whitespace-nowrap text-sm h-8"
            >
              Feedback
            </TabsTrigger>
            <TabsTrigger 
              value="calendar" 
              className="px-3 py-1.5 whitespace-nowrap text-sm h-8"
            >
              Calendar
            </TabsTrigger>
            <TabsTrigger 
              value="resources" 
              className="px-3 py-1.5 whitespace-nowrap text-sm h-8"
            >
              Resources
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className="px-3 py-1.5 whitespace-nowrap text-sm h-8"
            >
              Achievements
            </TabsTrigger>
            <TabsTrigger 
              value="exit" 
              className="px-3 py-1.5 whitespace-nowrap text-sm h-8"
            >
              Exit
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
