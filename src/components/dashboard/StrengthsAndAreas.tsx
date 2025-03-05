
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Lightbulb, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface StrengthsAndAreasProps {
  strengths: string[];
  areasForImprovement: string[];
}

export function StrengthsAndAreas({ strengths, areasForImprovement }: StrengthsAndAreasProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'strengths' | 'areas'>('strengths');
  const [showAllTopics, setShowAllTopics] = useState(false);
  
  const hasStrengths = strengths && strengths.length > 0;
  const hasAreas = areasForImprovement && areasForImprovement.length > 0;
  
  if (!hasStrengths && !hasAreas) {
    return null;
  }
  
  // Extract only topic names from strength statements with 90%+ performance
  const extractTopicNames = (strengthsList: string[]) => {
    const topicNames: string[] = [];
    
    strengthsList.forEach(strength => {
      // Check if the strength is about a specific topic and has a percentage
      if (strength.includes('Strong understanding of') && strength.includes('(')) {
        // Extract the topic name
        const topicMatch = strength.match(/Strong understanding of (.*?) \(/);
        if (topicMatch && topicMatch[1]) {
          const topic = topicMatch[1];
          
          // Extract the percentage
          const percentMatch = strength.match(/\((\d+)% correct\)/);
          if (percentMatch && percentMatch[1]) {
            const percentage = parseInt(percentMatch[1]);
            
            // Only include topics with 90% or above
            if (percentage >= 90) {
              topicNames.push(topic);
            }
          }
        }
      }
    });
    
    return topicNames;
  };
  
  const topicStrengths = extractTopicNames(strengths);
  
  // Do the same for areas of improvement - prioritize topic-specific feedback
  const specificAreas = areasForImprovement.filter(a => a.includes('Need to review'));
  const otherSpecificAreas = areasForImprovement.filter(a => 
    a.includes('(') && a.includes('%') && !a.includes('Need to review')
  );
  const genericAreas = areasForImprovement.filter(a => 
    !a.includes('Need to review') && (!a.includes('(') || !a.includes('%'))
  );
  
  // Combine specific areas first, then generic ones
  const orderedAreas = [...specificAreas, ...otherSpecificAreas, ...genericAreas];
  
  // Determine how many topics to show initially (before "Show More")
  const initialTopicsToShow = 3;
  const displayedTopicStrengths = showAllTopics ? topicStrengths : topicStrengths.slice(0, initialTopicsToShow);
  const hasMoreTopics = topicStrengths.length > initialTopicsToShow;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {activeTab === 'strengths' ? 
            <Lightbulb className="h-5 w-5 mr-2 text-amber-500" /> : 
            <AlertTriangle className="h-5 w-5 mr-2 text-blue-500" />
          }
          {activeTab === 'strengths' ? 'Your Strengths' : 'Areas to Improve'}
        </CardTitle>
        <div className="flex space-x-2 mt-2">
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
      </CardHeader>
      <CardContent>
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
            {hasAreas ? (
              <ul className={`${isMobile ? 'text-sm' : ''} list-disc pl-5 space-y-2`}>
                {orderedAreas.slice(0, 5).map((area, index) => (
                  <li key={index}>{area}</li>
                ))}
                {orderedAreas.length > 5 && (
                  <li className="text-muted-foreground">
                    +{orderedAreas.length - 5} more areas
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                No specific areas for improvement identified yet.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
