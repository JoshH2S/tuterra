
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
      <CardTitle className={`${isMobile ? 'text-lg' : ''} text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500`}>
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
