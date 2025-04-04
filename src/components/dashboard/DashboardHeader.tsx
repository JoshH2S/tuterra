
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardHeaderProps {
  title: string;
  description: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="mb-6">
      <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-2 bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500`}>{title}</h1>
      <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
        {description}
      </p>
    </div>
  );
}
