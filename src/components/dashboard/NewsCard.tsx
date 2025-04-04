
import { ExternalLink } from "lucide-react";
import { NewsItem } from "@/hooks/useNewsFeed";
import { motion } from "framer-motion";
import { useResponsive } from "@/hooks/useResponsive";

interface NewsCardProps {
  item: NewsItem;
}

export const NewsCard = ({ item }: NewsCardProps) => {
  const { isDesktop } = useResponsive();
  
  return (
    <motion.div
      whileHover={{ x: isDesktop ? 4 : 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="flex items-start justify-between p-3 rounded-lg hover:bg-blue-50/40 dark:hover:bg-gray-800/60 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-gray-700 touch-manipulation">
          <div className="space-y-1">
            <h3 className="font-medium group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {item.source} • {new Date(item.publishedAt).toLocaleDateString()}
            </p>
          </div>
          <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </a>
    </motion.div>
  );
};
