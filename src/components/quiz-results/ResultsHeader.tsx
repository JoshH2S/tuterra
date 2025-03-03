
import { useIsMobile } from "@/hooks/use-mobile";

interface ResultsHeaderProps {
  title: string;
}

export function ResultsHeader({ title }: ResultsHeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <>
      <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-2 text-[#091747]`}>
        {title}
      </h1>
      <p className="text-muted-foreground text-lg mb-6">
        Here's how you performed on this quiz
      </p>
    </>
  );
}
