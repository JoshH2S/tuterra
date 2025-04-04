
import { useEffect, useState } from "react";
import { Newspaper, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { StudentCourse } from "@/types/student";
import { useNewsFeed } from "@/hooks/useNewsFeed";
import { NewsCard } from "./NewsCard";
import { NewsEmptyState } from "./NewsEmptyState";
import { NewsNoResults } from "./NewsNoResults";
import { PremiumCard, PremiumContentCard } from "@/components/ui/premium-card";

interface NewsFeedProps {
  courses: StudentCourse[];
}

export const NewsFeed = ({ courses }: NewsFeedProps) => {
  const { 
    newsItems, 
    isLoading, 
    error, 
    isRefreshing, 
    hasTopics,
    checkUserTopics,
    handleRefresh 
  } = useNewsFeed();
  const [showTopicsDialog, setShowTopicsDialog] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkTopics = async () => {
      const hasUserTopics = await checkUserTopics();
      if (!hasUserTopics) {
        setShowTopicsDialog(true);
      }
    };
    checkTopics();
  }, []);

  const handleTopicsDialogClose = async () => {
    setShowTopicsDialog(false);
    await checkUserTopics();
  };

  if (!hasTopics) {
    return <NewsEmptyState 
      showTopicsDialog={showTopicsDialog} 
      onDialogClose={handleTopicsDialogClose} 
    />;
  }

  if (isLoading) {
    return (
      <PremiumCard className="mb-6 p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PremiumCard>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (newsItems.length === 0) {
    return <NewsNoResults />;
  }

  return (
    <PremiumContentCard 
      title="Latest News" 
      className="mb-6"
      variant="glass"
      headerAction={
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "default"} 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-9"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          <span className={isMobile ? "sr-only" : ""}>Refresh</span>
        </Button>
      }
    >
      <div className="space-y-4">
        {newsItems.map((item, index) => (
          <NewsCard key={index} item={item} />
        ))}
      </div>
    </PremiumContentCard>
  );
};
