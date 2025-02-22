
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
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type NewsTopic = 
  | 'business_economics'
  | 'political_science_law'
  | 'science_technology'
  | 'healthcare_medicine'
  | 'engineering_applied_sciences'
  | 'arts_humanities_social_sciences'
  | 'education_pedagogy'
  | 'mathematics_statistics'
  | 'industry_specific'
  | 'cybersecurity_it';

const NEWS_TOPICS = [
  { value: 'business_economics' as NewsTopic, label: 'Business & Economics' },
  { value: 'political_science_law' as NewsTopic, label: 'Political Science & Law' },
  { value: 'science_technology' as NewsTopic, label: 'Science & Technology' },
  { value: 'healthcare_medicine' as NewsTopic, label: 'Healthcare & Medicine' },
  { value: 'engineering_applied_sciences' as NewsTopic, label: 'Engineering & Applied Sciences' },
  { value: 'arts_humanities_social_sciences' as NewsTopic, label: 'Arts, Humanities & Social Sciences' },
  { value: 'education_pedagogy' as NewsTopic, label: 'Education & Pedagogy' },
  { value: 'mathematics_statistics' as NewsTopic, label: 'Mathematics & Statistics' },
  { value: 'industry_specific' as NewsTopic, label: 'Industry-Specific & Vocational Studies' },
  { value: 'cybersecurity_it' as NewsTopic, label: 'Cybersecurity & IT' },
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
  const [selectedTopics, setSelectedTopics] = useState<NewsTopic[]>([]);
  const [industrySpecific, setIndustrySpecific] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchUserTopics = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('user_news_preferences')
          .select('topics, industry_specific')
          .single();

        if (error) {
          console.error('Error fetching topics:', error);
          return;
        }

        if (data) {
          setSelectedTopics(data.topics || []);
          setIndustrySpecific(data.industry_specific || '');
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
          industry_specific: industrySpecific
        }, {
          onConflict: 'user_id'
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
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
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
          
          {selectedTopics.includes('industry_specific') && (
            <div className="space-y-2">
              <Label htmlFor="industry-specific">Specify your industry of interest</Label>
              <Input
                id="industry-specific"
                placeholder="Enter your specific industry"
                value={industrySpecific}
                onChange={(e) => setIndustrySpecific(e.target.value)}
              />
            </div>
          )}
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
