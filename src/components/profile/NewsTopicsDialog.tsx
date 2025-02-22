
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const NEWS_TOPICS = [
  { value: 'economics', label: 'Economics' },
  { value: 'finance', label: 'Finance' },
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
  { value: 'education', label: 'Education' },
  { value: 'policy', label: 'Policy' },
  { value: 'markets', label: 'Markets' },
  { value: 'entrepreneurship', label: 'Entrepreneurship' },
  { value: 'innovation', label: 'Innovation' },
  { value: 'sustainability', label: 'Sustainability' },
] as const;

interface NewsTopicsDialogProps {
  open: boolean;
  onClose: () => void;
  isFirstTimeSetup?: boolean;
}

export const NewsTopicsDialog = ({
  open,
  onClose,
  isFirstTimeSetup = false,
}: NewsTopicsDialogProps) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchUserTopics = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('user_news_preferences')
          .select('topics')
          .single();

        if (error) throw error;
        if (data) {
          setSelectedTopics(data.topics);
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    if (open) {
      fetchUserTopics();
    }
  }, [open]);

  const handleSaveTopics = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_news_preferences')
        .upsert({
          user_id: session.user.id,
          topics: selectedTopics,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your news preferences have been updated.",
      });
      onClose();
    } catch (error) {
      console.error('Error saving topics:', error);
      toast({
        title: "Error",
        description: "Failed to save news preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>News Preferences</DialogTitle>
          <DialogDescription>
            Select topics you're interested in to customize your news feed.
            {isFirstTimeSetup && " You can always change these later in your profile settings."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {NEWS_TOPICS.map((topic) => (
            <div key={topic.value} className="flex items-center space-x-2">
              <Checkbox
                id={topic.value}
                checked={selectedTopics.includes(topic.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedTopics([...selectedTopics, topic.value]);
                  } else {
                    setSelectedTopics(selectedTopics.filter(t => t !== topic.value));
                  }
                }}
              />
              <Label htmlFor={topic.value}>{topic.label}</Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            {isFirstTimeSetup ? "Skip" : "Cancel"}
          </Button>
          <Button 
            onClick={handleSaveTopics}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save preferences'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
