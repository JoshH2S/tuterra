
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ModernCard } from "@/components/ui/modern-card";

// Mock task data
const currentTasks = [
  {
    id: 1,
    title: "Market Segmentation Analysis",
    deadline: "May 26, 2025",
    summary: "Analyze customer data to identify 3-5 key market segments based on demographics and purchase behavior.",
  },
  {
    id: 2,
    title: "Competitor Review Document",
    deadline: "May 30, 2025",
    summary: "Create a detailed report on our top 3 competitors including strengths, weaknesses, and market positioning.",
  },
];

const pastTasks = [
  {
    id: 3,
    title: "Brand Voice Guidelines",
    deadline: "May 15, 2025",
    summary: "Develop brand voice documentation for consistent messaging across all platforms.",
    status: "Completed",
  },
  {
    id: 4,
    title: "Customer Survey Results",
    deadline: "May 10, 2025",
    summary: "Analyze and present findings from the Q2 customer satisfaction survey.",
    status: "Completed",
  },
  {
    id: 5,
    title: "Social Media Audit",
    deadline: "May 5, 2025",
    summary: "Review performance metrics for all social media channels.",
    status: "Completed Late",
  },
];

export function TaskOverview() {
  const [showPastTasks, setShowPastTasks] = useState(false);
  
  return (
    <ModernCard className="overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Task Overview</h2>
        
        <div className="space-y-4">
          {/* Current Tasks */}
          <div>
            <h3 className="text-md font-medium mb-2">Current Tasks</h3>
            <div className="space-y-3">
              {currentTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-base">{task.title}</h4>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                      Due {task.deadline}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 my-2">{task.summary}</p>
                  <button className="text-sm text-primary hover:text-primary-dark font-medium mt-1">
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Past Tasks Toggle */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              onClick={() => setShowPastTasks(!showPastTasks)}
              className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors w-full justify-between"
            >
              <span>Past Tasks ({pastTasks.length})</span>
              {showPastTasks ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          
          {/* Past Tasks List (Collapsible) */}
          {showPastTasks && (
            <div className="space-y-2 pt-1">
              {pastTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <span 
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        task.status === "Completed" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModernCard>
  );
}
