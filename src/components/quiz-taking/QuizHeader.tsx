
import { CardHeader, CardTitle } from "@/components/ui/card";
import { QuizTimer } from "./QuizTimer";
import { useIsMobile } from "@/hooks/use-mobile";

interface QuizHeaderProps {
  title: string;
  timeRemaining: number | null;
  onTimeUp: () => void;
}

export const QuizHeader = ({ title, timeRemaining, onTimeUp }: QuizHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <QuizTimer 
        timeRemaining={timeRemaining} 
        onTimeUp={onTimeUp}
        active={true}
      />
      
      <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} text-primary hidden sm:block`}>
        {title}
      </CardTitle>
    </div>
  );
};
