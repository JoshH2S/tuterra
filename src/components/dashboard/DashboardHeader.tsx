
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardHeaderProps {
  title: string;
  description: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="mb-6">
      <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-300 dark:from-primary-400 dark:to-primary-200`}>{title}</h1>
      <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
        {description}
      </p>
    </div>
  );
}
