import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface AchievementCardProps {
  title: string;
  description: string;
  icon: string;
  type: string;
  earnedAt?: string;
  metadata?: any;
  isUnlocked: boolean;
}

export function AchievementCard({
  title,
  description,
  icon,
  type,
  earnedAt,
  metadata,
  isUnlocked
}: AchievementCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const formatEarnedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'completion': return '✅';
      case 'engagement': return '🎯';
      case 'performance': return '⚡';
      case 'milestone': return '🏆';
      case 'streak': return '🔥';
      default: return '🎉';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'completion': return 'bg-green-100 border-green-300 text-green-700';
      case 'engagement': return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'performance': return 'bg-purple-100 border-purple-300 text-purple-700';
      case 'milestone': return 'bg-yellow-100 border-yellow-400 text-yellow-700 shadow-lg';
      case 'streak': return 'bg-red-100 border-red-300 text-red-700';
      default: return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'completion': return 'bg-green-500';
      case 'engagement': return 'bg-blue-500';
      case 'performance': return 'bg-purple-500';
      case 'milestone': return 'bg-yellow-500';
      case 'streak': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative">
      <Card
        className={`
          p-4 transition-all duration-200 cursor-pointer select-none
          ${isUnlocked 
            ? `${getTypeColor(type)} hover:scale-105 hover:shadow-md` 
            : 'bg-gray-50 border-gray-200 opacity-60'
          }
          ${type === 'milestone' ? 'animate-pulse' : ''}
        `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-start space-x-3">
          {/* Achievement Icon */}
          <div className={`text-2xl flex-shrink-0 ${!isUnlocked ? 'grayscale' : ''}`}>
            {isUnlocked ? icon : '🔒'}
          </div>

          {/* Achievement Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`font-semibold text-sm truncate ${!isUnlocked ? 'text-gray-500' : ''}`}>
                {isUnlocked ? title : '???'}
              </h3>
              {isUnlocked && (
                <Badge className={`${getTypeBadgeColor(type)} text-white text-xs px-1.5 py-0.5`}>
                  {type}
                </Badge>
              )}
            </div>

            <p className={`text-xs mb-2 line-clamp-2 ${!isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
              {isUnlocked ? description : 'Complete tasks to unlock this achievement'}
            </p>

            {/* Achievement Stats */}
            {isUnlocked && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center">
                    {getTypeEmoji(type)} {type}
                  </span>
                </div>
              </div>
            )}

            {/* Earned Date */}
            {isUnlocked && earnedAt && (
              <div className="mt-2 text-xs text-gray-500">
                Earned {formatEarnedDate(earnedAt)}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Hover Tooltip */}
      {showTooltip && isUnlocked && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-black text-white text-xs rounded-lg shadow-lg max-w-64">
          <div className="font-semibold mb-1">{title}</div>
          <div className="mb-2">{description}</div>
          {metadata && (
            <div className="text-gray-300 text-xs">
              {JSON.stringify(metadata, null, 2)}
            </div>
          )}
          
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black" />
        </div>
      )}
    </div>
  );
} 