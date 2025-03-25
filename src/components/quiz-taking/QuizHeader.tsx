
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
    <CardHeader className={`
      flex flex-col sm:flex-row items-start sm:items-center justify-between
      ${isMobile ? 'p-3 space-y-2 sm:space-y-0' : ''}
    `}>
      <CardTitle className={isMobile ? 'text-lg' : ''}>
        {title}
      </CardTitle>
      <QuizTimer 
        timeRemaining={timeRemaining} 
        onTimeUp={onTimeUp}
        active={true}
      />
    </CardHeader>
  );
};
