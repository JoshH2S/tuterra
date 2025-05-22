
import { useIsMobile } from "@/hooks/use-mobile";
import { SwipeableInternshipView } from "@/components/internship/SwipeableInternshipView";

export default function VirtualInternshipDashboard() {
  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <SwipeableInternshipView />
    </div>
  );
}
