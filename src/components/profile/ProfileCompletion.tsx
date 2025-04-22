
import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";

interface ProfileCompletionProps {
  profile: {
    firstName: string;
    lastName: string;
    school: string;
    avatarUrl: string;
  };
}

export const ProfileCompletion = ({ profile }: ProfileCompletionProps) => {
  // Use useMemo hook to calculate profile completion
  const { percentage, completedFields, totalFields } = useMemo(() => {
    // Define required profile fields
    const fields = [
      { name: 'firstName', value: profile.firstName },
      { name: 'lastName', value: profile.lastName },
      { name: 'school', value: profile.school },
      { name: 'avatarUrl', value: profile.avatarUrl }
    ];
    
    // Count completed fields (non-empty)
    const completed = fields.filter(field => field.value && field.value.trim() !== '').length;
    
    // Calculate percentage
    const percent = Math.round((completed / fields.length) * 100);
    
    return {
      percentage: percent,
      completedFields: completed,
      totalFields: fields.length
    };
  }, [profile]);
  
  // Determine color based on completion percentage - don't use hooks in this function
  const getColorClass = () => {
    if (percentage < 30) return "bg-red-500";
    if (percentage < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Profile Completion</span>
        <span className="text-muted-foreground">
          {completedFields} of {totalFields} fields completed ({percentage}%)
        </span>
      </div>
      <Progress 
        value={percentage} 
        indicatorClassName={getColorClass()}
        className="h-2"
      />
    </div>
  );
};
