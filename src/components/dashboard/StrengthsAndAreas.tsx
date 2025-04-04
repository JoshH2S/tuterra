import { useIsMobile } from "@/hooks/use-mobile";
import { Lightbulb, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PremiumContentCard } from "@/components/ui/premium-card";

interface StrengthsAndAreasProps {
  strengths: string[];
  areasForImprovement: string[];
}

export function StrengthsAndAreas({ strengths, areasForImprovement }: StrengthsAndAreasProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'strengths' | 'areas'>('strengths');
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [showAllWeakTopics, setShowAllWeakTopics] = useState(false);
  
  const hasStrengths = strengths && strengths.length > 0;
  const hasAreas = areasForImprovement && areasForImprovement.length > 0;
  
  if (!hasStrengths && !hasAreas) {
    return null;
  }
  
  // Extract only topic names from strength statements with 90%+ performance
  const extractTopicNames = (strengthsList: string[]) => {
    const topicNames: string[] = [];
    
    strengthsList.forEach(strength => {
      if (strength.includes('Strong understanding of') && strength.includes('(')) {
        const topicMatch = strength.match(/Strong understanding of (.*?) \(/);
        if (topicMatch && topicMatch[1]) {
          const topic = topicMatch[1];
          
          const percentMatch = strength.match(/\((\d+)% correct\)/);
          if (percentMatch && percentMatch[1]) {
            const percentage = parseInt(percentMatch[1]);
            
            if (percentage >= 90) {
              topicNames.push(topic);
            }
          }
        }
      }
    });
    
    return topicNames;
  };
  
  // Extract topic names from areas for improvement with less than 80% performance
  const extractWeakTopicNames = (areasList: string[]) => {
    const weakTopics: string[] = [];
    
    areasList.forEach(area => {
      if (area.includes('(') && area.includes('%')) {
        let topicName = '';
        let percentage = 0;
        
        if (area.includes('Need to review')) {
          const topicMatch = area.match(/Need to review (.*?) \(/);
          if (topicMatch && topicMatch[1]) {
            topicName = topicMatch[1];
          }
        } 
        else if (area.includes('Practice with more examples on')) {
          const topicMatch = area.match(/Practice with more examples on (.*?) to/);
          if (topicMatch && topicMatch[1]) {
            topicName = topicMatch[1];
          }
        }
        else if (area.includes('Revisit the fundamentals of')) {
          const topicMatch = area.match(/Revisit the fundamentals of (.*?) -/);
          if (topicMatch && topicMatch[1]) {
            topicName = topicMatch[1];
          }
        }
        else if (area.includes('Focus on mastering the basic concepts of')) {
          const topicMatch = area.match(/Focus on mastering the basic concepts of (.*?) -/);
          if (topicMatch && topicMatch[1]) {
            topicName = topicMatch[1];
          }
        }
        
        const percentMatch = area.match(/\((\d+)% correct\)/);
        if (percentMatch && percentMatch[1]) {
          percentage = parseInt(percentMatch[1]);
        }
        
        if (topicName && percentage < 80) {
          weakTopics.push(topicName);
        }
      }
    });
    
    return weakTopics;
  };
  
  const topicStrengths = extractTopicNames(strengths);
  const weakTopics = extractWeakTopicNames(areasForImprovement);
  
  // Determine how many topics to show initially (before "Show More")
  const initialTopicsToShow = 3;
  const displayedTopicStrengths = showAllTopics ? topicStrengths : topicStrengths.slice(0, initialTopicsToShow);
  const hasMoreTopics = topicStrengths.length > initialTopicsToShow;
  
  const displayedWeakTopics = showAllWeakTopics ? weakTopics : weakTopics.slice(0, initialTopicsToShow);
  const hasMoreWeakTopics = weakTopics.length > initialTopicsToShow;
  
  return (
    <PremiumContentCard
      title={
        <div className="flex items-center">
          {activeTab === 'strengths' ? 
            <Lightbulb className="h-5 w-5 mr-2 text-amber-500" /> : 
            <AlertTriangle className="h-5 w-5 mr-2 text-blue-500" />
          }
          {activeTab === 'strengths' ? 'Your Strengths' : 'Areas to Improve'}
        </div>
      }
      variant="elevated"
      headerAction={
        <div className="flex space-x-2">
          <Button 
            variant={activeTab === 'strengths' ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveTab('strengths')}
            className={`${activeTab === 'strengths' ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
          >
            Strengths
          </Button>
          <Button 
            variant={activeTab === 'areas' ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveTab('areas')}
            className={`${activeTab === 'areas' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
          >
            Areas to Improve
          </Button>
        </div>
      }
    >
      {activeTab === 'strengths' && (
        <>
          {hasStrengths && topicStrengths.length > 0 ? (
            <div>
              <ul className={`${isMobile ? 'text-sm' : ''} list-disc pl-5 space-y-2`}>
                {displayedTopicStrengths.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
              
              {hasMoreTopics && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAllTopics(!showAllTopics)} 
                  className="mt-2 text-muted-foreground hover:text-primary flex items-center"
                >
                  {showAllTopics ? (
                    <>Show Less <ChevronUp className="ml-1 h-4 w-4" /></>
                  ) : (
                    <>View All {topicStrengths.length} Topics <ChevronDown className="ml-1 h-4 w-4" /></>
                  )}
                </Button>
              )}
            </div>
          ) : hasStrengths ? (
            <p className="text-muted-foreground">
              No topics with strong performance (90%+) yet.
            </p>
          ) : (
            <p className="text-muted-foreground">
              Complete more quizzes to identify your strengths.
            </p>
          )}
        </>
      )}
      
      {activeTab === 'areas' && (
        <>
          {hasAreas && weakTopics.length > 0 ? (
            <div>
              <ul className={`${isMobile ? 'text-sm' : ''} list-disc pl-5 space-y-2`}>
                {displayedWeakTopics.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
              
              {hasMoreWeakTopics && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAllWeakTopics(!showAllWeakTopics)} 
                  className="mt-2 text-muted-foreground hover:text-primary flex items-center"
                >
                  {showAllWeakTopics ? (
                    <>Show Less <ChevronUp className="ml-1 h-4 w-4" /></>
                  ) : (
                    <>View All {weakTopics.length} Topics <ChevronDown className="ml-1 h-4 w-4" /></>
                  )}
                </Button>
              )}
            </div>
          ) : hasAreas ? (
            <p className="text-muted-foreground">
              No specific topics below 80% identified.
            </p>
          ) : (
            <p className="text-muted-foreground">
              No specific areas for improvement identified yet.
            </p>
          )}
        </>
      )}
    </PremiumContentCard>
  );
}
