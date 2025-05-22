
import { useState } from "react";
import { ButtonScrollable } from "../ui/button-scrollable";

interface MobileInternshipHeaderProps {
  selectedView: string;
  setSelectedView: (view: string) => void;
}

export function MobileInternshipHeader({ 
  selectedView, 
  setSelectedView 
}: MobileInternshipHeaderProps) {
  const views = [
    { id: "overview", label: "Overview" },
    { id: "tasks", label: "Tasks" },
    { id: "messages", label: "Messages" },
    { id: "feedback", label: "Feedback" },
    { id: "calendar", label: "Calendar" },
    { id: "resources", label: "Resources" },
    { id: "achievements", label: "Achievements" },
    { id: "exit", label: "Next Steps" },
  ];

  return (
    <div className="mb-4">
      <h1 className="text-xl font-bold mb-4">Virtual Internship</h1>
      <ButtonScrollable>
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => setSelectedView(view.id)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-full ${
              selectedView === view.id
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            } touch-manipulation transition-colors`}
          >
            {view.label}
          </button>
        ))}
      </ButtonScrollable>
    </div>
  );
}
