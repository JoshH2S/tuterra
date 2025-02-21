
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Newspaper, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { StudentCourse } from "@/types/student";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

  useEffect(() => {
    const fetchNews = async () => {
      setError(null);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        // Default economics-related search terms
        const searchTerms = '"economics news" OR "financial markets" OR "economic trends"';

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
          description: "Unable to load economics news. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

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
          No recent economics news found. Check back later for updates.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Latest Economics News
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
