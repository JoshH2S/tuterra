
import { useIsMobile } from "@/hooks/use-mobile";

interface ResultsHeaderProps {
  title: string;
}

export function ResultsHeader({ title }: ResultsHeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <>
      <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-300 dark:from-primary-400 dark:to-primary-200`}>
        {title}
      </h1>
      <p className="text-muted-foreground text-lg mb-6">
        Here's how you performed on this quiz
      </p>
    </>
  );
}
