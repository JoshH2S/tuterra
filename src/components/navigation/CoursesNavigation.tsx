
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BookOpen, Video, FileText } from 'lucide-react';

export const CoursesNavigation = () => {
  const location = useLocation();
  
  return (
    <nav className="border-b px-4">
      <ul className="flex space-x-8 overflow-x-auto">
        <li>
          <NavLink
            to="/courses"
            end
            className={({ isActive }) => cn(
              "flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors",
              isActive 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <BookOpen className="h-4 w-4" />
            <span>All Courses</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/courses/videos"
            className={({ isActive }) => cn(
              "flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors",
              isActive 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <Video className="h-4 w-4" />
            <span>Video Lectures</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/courses/materials"
            className={({ isActive }) => cn(
              "flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors",
              isActive 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <FileText className="h-4 w-4" />
            <span>Materials</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};
