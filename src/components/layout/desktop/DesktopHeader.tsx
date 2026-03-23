
import { usePromotionalInternships } from "@/hooks/usePromotionalInternships";
import { PromotionalBadge } from "@/components/promotional/PromotionalBadge";

export function DesktopHeader() {
  const { status } = usePromotionalInternships();

  // Only render the header when there's something meaningful to show
  if (!status.hasPromotionalInternships) return null;

  return (
    <header className="sticky top-0 z-40 hidden lg:block border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-end px-6">
        <PromotionalBadge
          internshipsRemaining={status.internshipsRemaining}
          promoCode={status.promoCodeUsed}
          compact={false}
        />
      </div>
    </header>
  );
}
