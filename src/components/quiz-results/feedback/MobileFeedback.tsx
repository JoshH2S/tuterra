
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FeedbackHeader } from "./FeedbackHeader";
import { AIFeedback } from "../DetailedFeedback";

interface MobileFeedbackProps {
  feedback: AIFeedback;
}

export function MobileFeedback({ feedback }: MobileFeedbackProps) {
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
  
  // Ensure arrays are properly initialized
  const strengths = Array.isArray(feedback.strengths) ? feedback.strengths : [];
  const areasForImprovement = Array.isArray(feedback.areas_for_improvement) ? feedback.areas_for_improvement : [];
  
  return (
    <div 
      className="space-y-4" 
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <FeedbackHeader />
      
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
            {feedback.advice ? (
              <p className="text-sm">{feedback.advice}</p>
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
