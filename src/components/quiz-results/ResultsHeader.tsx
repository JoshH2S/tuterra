
import { useIsMobile } from "@/hooks/use-mobile";

interface ResultsHeaderProps {
  title: string;
}

export function ResultsHeader({ title }: ResultsHeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <>
      <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-2 bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500`}>
        {title}
      </h1>
      <p className="text-muted-foreground text-lg mb-6">
        Here's how you performed on this quiz
      </p>
    </>
  );
}
