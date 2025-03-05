
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

const SUPABASE_URL = "https://nhlsrtubyvggtkyrhkuu.supabase.co";
const MAX_ARTICLES = 5;

export const useNewsFeed = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasTopics, setHasTopics] = useState(false);

  const checkUserTopics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: preferences } = await supabase
        .from('user_news_preferences')
        .select('topics')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!preferences?.topics || preferences.topics.length === 0) {
        setHasTopics(false);
        return false;
      } else {
        setHasTopics(true);
        await fetchNews(preferences.topics);
        return true;
      }
    } catch (error) {
      console.error('Error checking topics:', error);
      setError('Failed to load news preferences');
      return false;
    }
  };

  const fetchNews = async (topics: string[]) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Convert topic names to search terms by replacing underscores with spaces
      const searchTerms = topics
        .map(topic => topic.replace(/_/g, ' '))
        .join(' OR ');
      console.log('Searching news with terms:', searchTerms);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-course-news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ searchTerms }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      console.log('News API response:', data);

      if (!data.articles || data.articles.length === 0) {
        console.log('No news articles found');
      }

      // Limit to MAX_ARTICLES
      setNewsItems((data.articles || []).slice(0, MAX_ARTICLES));
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
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: preferences } = await supabase
        .from('user_news_preferences')
        .select('topics')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (preferences?.topics) {
        await fetchNews(preferences.topics);
        toast({
          title: "News refreshed",
          description: "Latest articles have been loaded",
        });
      }
    } catch (error) {
      console.error('Error refreshing news:', error);
      toast({
        title: "Refresh failed",
        description: "Unable to refresh news. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    newsItems,
    isLoading,
    error,
    isRefreshing,
    hasTopics,
    setHasTopics,
    checkUserTopics,
    handleRefresh
  };
};
