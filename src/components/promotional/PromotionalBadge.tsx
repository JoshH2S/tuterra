import { Gift, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface PromotionalBadgeProps {
  internshipsRemaining: number;
  promoCode: string | null;
  compact?: boolean;
}

export const PromotionalBadge = ({ 
  internshipsRemaining, 
  promoCode,
  compact = false 
}: PromotionalBadgeProps) => {
  const navigate = useNavigate();

  if (internshipsRemaining <= 0) return null;

  const handleClick = () => {
    navigate('/dashboard/virtual-internship/new');
  };

  if (compact) {
    // Mobile version
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClick}
              className="cursor-pointer"
            >
              <Badge 
                variant="default" 
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 gap-1 px-2 py-1"
              >
                <Gift className="h-3 w-3" />
                <span className="text-xs font-semibold">{internshipsRemaining}</span>
              </Badge>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm font-medium">
              {internshipsRemaining} Free Virtual Internship{internshipsRemaining > 1 ? 's' : ''}
            </p>
            {promoCode && (
              <p className="text-xs text-muted-foreground">Promo: {promoCode}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Desktop version
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="cursor-pointer"
    >
      <Badge 
        variant="default" 
        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 gap-2 px-3 py-1.5 shadow-md"
      >
        <Gift className="h-4 w-4" />
        <div className="flex flex-col items-start leading-tight">
          <span className="text-xs font-semibold">
            {internshipsRemaining} Free Internship{internshipsRemaining > 1 ? 's' : ''}
          </span>
          {promoCode && (
            <span className="text-[10px] opacity-90">
              {promoCode}
            </span>
          )}
        </div>
        <Sparkles className="h-3 w-3 animate-pulse" />
      </Badge>
    </motion.div>
  );
};
