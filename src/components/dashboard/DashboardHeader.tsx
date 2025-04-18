
import { useIsMobile } from "@/hooks/use-mobile";

export interface DashboardHeaderProps {
  title: string;
  description: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="mb-6">
      <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-2 gradient-text`}>{title}</h1>
      <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
        {description}
      </p>
    </div>
  );
}
