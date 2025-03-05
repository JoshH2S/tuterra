
import { ExternalLink } from "lucide-react";
import { NewsItem } from "@/hooks/useNewsFeed";

interface NewsCardProps {
  item: NewsItem;
}

export const NewsCard = ({ item }: NewsCardProps) => {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="flex items-start justify-between p-3 rounded-lg hover:bg-muted transition-colors">
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
  );
};
