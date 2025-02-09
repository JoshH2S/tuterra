
import { CardHeader, CardTitle } from "@/components/ui/card";
import { QuizTimer } from "./QuizTimer";

interface QuizHeaderProps {
  title: string;
  timeRemaining: number | null;
  onTimeUp: () => void;
}

export const QuizHeader = ({ title, timeRemaining, onTimeUp }: QuizHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>{title}</CardTitle>
      <QuizTimer timeRemaining={timeRemaining} onTimeUp={onTimeUp} />
    </CardHeader>
  );
};
