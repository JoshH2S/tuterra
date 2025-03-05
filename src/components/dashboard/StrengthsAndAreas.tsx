
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Lightbulb, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface StrengthsAndAreasProps {
  strengths: string[];
  areasForImprovement: string[];
}

export function StrengthsAndAreas({ strengths, areasForImprovement }: StrengthsAndAreasProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'strengths' | 'areas'>('strengths');
  
  const hasStrengths = strengths && strengths.length > 0;
  const hasAreas = areasForImprovement && areasForImprovement.length > 0;
  
  if (!hasStrengths && !hasAreas) {
    return null;
  }
  
  // Filter out common generic strengths and focus on topic-specific ones first
  const specificStrengths = strengths.filter(s => s.includes('(') && s.includes('%'));
  const genericStrengths = strengths.filter(s => !s.includes('(') || !s.includes('%'));
  
  // Combine specific strengths first, then generic ones
  const orderedStrengths = [...specificStrengths, ...genericStrengths];
  
  // Do the same for areas of improvement
  const specificAreas = areasForImprovement.filter(a => a.includes('(') && a.includes('%'));
  const genericAreas = areasForImprovement.filter(a => !a.includes('(') || !a.includes('%'));
  
  // Combine specific areas first, then generic ones
  const orderedAreas = [...specificAreas, ...genericAreas];
  
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
            {hasStrengths ? (
              <ul className={`${isMobile ? 'text-sm' : ''} list-disc pl-5 space-y-2`}>
                {orderedStrengths.slice(0, 5).map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
                {orderedStrengths.length > 5 && (
                  <li className="text-muted-foreground">
                    +{orderedStrengths.length - 5} more strengths
                  </li>
                )}
              </ul>
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
