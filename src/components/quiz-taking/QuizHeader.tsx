
import { CardHeader, CardTitle } from "@/components/ui/card";
import { QuizTimer } from "./QuizTimer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Progress } from "@/components/ui/progress";

interface QuizHeaderProps {
  title: string;
  timeRemaining: number | null;
  onTimeUp: () => void;
  currentQuestion?: number;
  totalQuestions?: number;
}

export const QuizHeader = ({ 
  title, 
  timeRemaining, 
  onTimeUp,
  currentQuestion,
  totalQuestions
}: QuizHeaderProps) => {
  const isMobile = useIsMobile();
  
  // Calculate progress percentage if both current and total questions are provided
  const progressPercentage = currentQuestion && totalQuestions 
    ? Math.round((currentQuestion / totalQuestions) * 100)
    : null;
  
  return (
    <>
      {/* Floating header for all devices */}
      <div className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-3xl z-10">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <QuizTimer 
              timeRemaining={timeRemaining} 
              onTimeUp={onTimeUp}
              active={true}
            />
            
            {progressPercentage !== null && (
              <div className="w-full max-w-xs ml-4">
                <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-in-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span className="truncate">Question {currentQuestion} of {totalQuestions}</span>
                  <span className="ml-2">{progressPercentage}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Regular CardHeader (non-floating) */}
      <CardHeader className={`
        flex flex-col sm:flex-row sm:items-center justify-between mt-14
        ${isMobile ? 'p-3 space-y-2 sm:space-y-0' : ''}
      `}>
        <CardTitle className={`${isMobile ? 'text-lg' : ''} gradient-text`}>
          {title}
        </CardTitle>
      </CardHeader>
    </>
  );
};
