
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Newspaper, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { StudentCourse } from "@/types/student";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NewsTopicsDialog } from "@/components/profile/NewsTopicsDialog";

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

interface NewsFeedProps {
  courses: StudentCourse[];
}

export const NewsFeed = ({ courses }: NewsFeedProps) => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTopicsDialog, setShowTopicsDialog] = useState(false);
  const [hasTopics, setHasTopics] = useState(false);

  useEffect(() => {
    const checkUserTopics = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: preferences } = await supabase
          .from('user_news_preferences')
          .select('topics:topics')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (!preferences?.topics || preferences.topics.length === 0) {
          setShowTopicsDialog(true);
        } else {
          setHasTopics(true);
          fetchNews(preferences.topics);
        }
      } catch (error) {
        console.error('Error checking topics:', error);
        setError('Failed to load news preferences');
      }
    };

    checkUserTopics();
  }, []);

  const fetchNews = async (topics: string[]) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Create search terms from user's selected topics
      const searchTerms = topics.map(topic => `"${topic}"`).join(' OR ');
      console.log('Searching news with terms:', searchTerms);

      const response = await fetch(`https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/fetch-course-news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ searchTerms }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch news');
      }
      
      const data = await response.json();
      console.log('News API response:', data);
      
      if (!data.articles || data.articles.length === 0) {
        console.log('No news articles found');
      } else {
        console.log('Found articles:', data.articles.length);
      }

      setNewsItems(data.articles || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch news');
      toast({
        title: "Error fetching news",
        description: "Unable to load news. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicsDialogClose = () => {
    setShowTopicsDialog(false);
    // Refresh the news feed after closing the dialog
    checkUserTopics();
  };

  const checkUserTopics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('user_news_preferences')
        .select('topics')
        .single();

      if (error) throw error;
      
      if (data && data.topics.length > 0) {
        setHasTopics(true);
        fetchNews(data.topics);
      }
    } catch (error) {
      console.error('Error checking topics:', error);
    }
  };

  if (!hasTopics) {
    return (
      <>
        <Alert className="mb-6">
          <Newspaper className="h-4 w-4" />
          <AlertDescription>
            Select your topics of interest to personalize your news feed
          </AlertDescription>
        </Alert>
        <NewsTopicsDialog
          open={showTopicsDialog}
          onClose={handleTopicsDialogClose}
          isFirstTimeSetup={true}
        />
      </>
    );
  }

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
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
    return (
      <Alert className="mb-6">
        <Newspaper className="h-4 w-4" />
        <AlertDescription>
          No recent news found for your selected topics. Try selecting different topics in your profile settings.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Latest News
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {newsItems.map((item, index) => (
            <a
              key={index}
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
