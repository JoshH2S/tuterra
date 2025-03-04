
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

interface AIFeedback {
  strengths?: string[];
  areas_for_improvement?: string[];
  advice?: string;
}

interface DetailedFeedbackProps {
  feedback: AIFeedback | null | undefined;
  isGenerating?: boolean;
}

export function DetailedFeedback({ feedback, isGenerating = false }: DetailedFeedbackProps) {
  const isMobile = useIsMobile();
  const [parsedFeedback, setParsedFeedback] = useState<AIFeedback | null>(null);
  const [activeFeedbackTab, setActiveFeedbackTab] = useState<string>("strengths");
  
  // Track touch gestures for mobile swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Minimum swipe distance in pixels
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    // Navigate between feedback tabs on swipe
    if (isLeftSwipe) {
      if (activeFeedbackTab === "strengths") setActiveFeedbackTab("areas");
      else if (activeFeedbackTab === "areas") setActiveFeedbackTab("advice");
    }
    
    if (isRightSwipe) {
      if (activeFeedbackTab === "advice") setActiveFeedbackTab("areas");
      else if (activeFeedbackTab === "areas") setActiveFeedbackTab("strengths");
    }
  };
  
  useEffect(() => {
    // Handle different feedback formats and ensure we parse correctly
    if (feedback) {
      try {
        // If feedback is a string, attempt to parse it
        if (typeof feedback === 'string') {
          setParsedFeedback(JSON.parse(feedback));
        } 
        // If it's an object, use it directly
        else {
          setParsedFeedback(feedback);
        }
      } catch (e) {
        console.error("Error parsing feedback:", e);
        setParsedFeedback(null);
      }
    } else {
      setParsedFeedback(null);
    }
  }, [feedback]);

  console.log("Feedback data:", feedback);
  console.log("Parsed feedback:", parsedFeedback);

  // If feedback is being generated, show loading state
  if (isGenerating || (parsedFeedback?.strengths && parsedFeedback.strengths[0] === "Generating feedback...")) {
    return (
      <div className="space-y-4">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-[#091747] flex items-center`}>
          <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
          AI Feedback
          <span className="ml-2 text-sm font-normal text-muted-foreground">(Generating...)</span>
        </h2>
        <Card>
          <CardContent className={`${isMobile ? 'p-3 pt-4' : 'pt-6'} space-y-2`}>
            <h3 className="text-lg font-semibold mb-3 text-[#091747]">Analyzing your performance</h3>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Handle case when feedback is null or undefined
  if (!parsedFeedback) {
    return (
      <div className="space-y-4">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-[#091747] flex items-center`}>
          <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
          AI Feedback
        </h2>
        <Card>
          <CardContent className={`${isMobile ? 'p-3 pt-4' : 'pt-6'}`}>
            <p className="text-muted-foreground">Feedback not available for this quiz yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ensure arrays are properly initialized
  const strengths = Array.isArray(parsedFeedback.strengths) ? parsedFeedback.strengths : [];
  const areasForImprovement = Array.isArray(parsedFeedback.areas_for_improvement) ? parsedFeedback.areas_for_improvement : [];

  // If on mobile, show different tabs that can be swiped between
  if (isMobile) {
    return (
      <div 
        className="space-y-4" 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <h2 className="text-xl font-bold text-[#091747] flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
          AI Feedback
        </h2>
        
        <div className="flex border-b border-gray-200 mb-2">
          <button 
            className={`flex-1 py-2 text-sm font-medium ${activeFeedbackTab === "strengths" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
            onClick={() => setActiveFeedbackTab("strengths")}
          >
            Strengths
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium ${activeFeedbackTab === "areas" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
            onClick={() => setActiveFeedbackTab("areas")}
          >
            Improve
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium ${activeFeedbackTab === "advice" ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
            onClick={() => setActiveFeedbackTab("advice")}
          >
            Advice
          </button>
        </div>
        
        {activeFeedbackTab === "strengths" && (
          <Card className="border-t-4 border-t-green-500">
            <CardContent className="p-3 pt-4">
              <h3 className="text-lg font-semibold mb-3 text-[#091747]">Areas of Strength</h3>
              {strengths.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">
                  {strengths.map((strength, index) => (
                    <li key={index} className="text-sm">{strength}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No specific strengths identified.</p>
              )}
            </CardContent>
          </Card>
        )}
        
        {activeFeedbackTab === "areas" && (
          <Card className="border-t-4 border-t-amber-500">
            <CardContent className="p-3 pt-4">
              <h3 className="text-lg font-semibold mb-3 text-[#091747]">Areas for Improvement</h3>
              {areasForImprovement.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">
                  {areasForImprovement.map((area, index) => (
                    <li key={index} className="text-sm">{area}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No specific areas for improvement identified.</p>
              )}
            </CardContent>
          </Card>
        )}
        
        {activeFeedbackTab === "advice" && (
          <Card className="border-t-4 border-t-blue-500">
            <CardContent className="p-3 pt-4">
              <h3 className="text-lg font-semibold mb-3 text-[#091747]">Advice Going Forward</h3>
              {parsedFeedback.advice ? (
                <p className="text-sm">{parsedFeedback.advice}</p>
              ) : (
                <p className="text-muted-foreground">No specific advice available.</p>
              )}
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-center gap-2 pt-2">
          <span className={`h-2 w-2 rounded-full ${activeFeedbackTab === "strengths" ? "bg-primary" : "bg-gray-300"}`}></span>
          <span className={`h-2 w-2 rounded-full ${activeFeedbackTab === "areas" ? "bg-primary" : "bg-gray-300"}`}></span>
          <span className={`h-2 w-2 rounded-full ${activeFeedbackTab === "advice" ? "bg-primary" : "bg-gray-300"}`}></span>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#091747] flex items-center">
        <Sparkles className="h-6 w-6 mr-2 text-amber-500" />
        AI Feedback
      </h2>
      
      <Card className="border-t-4 border-t-green-500">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-3 text-[#091747]">Areas of Strength</h3>
          {strengths.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No specific strengths identified.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-amber-500">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-3 text-[#091747]">Areas for Improvement</h3>
          {areasForImprovement.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {areasForImprovement.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No specific areas for improvement identified.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-blue-500">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-3 text-[#091747]">Advice Going Forward</h3>
          {parsedFeedback.advice ? (
            <p>{parsedFeedback.advice}</p>
          ) : (
            <p className="text-muted-foreground">No specific advice available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
