import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Star, Sparkles, CheckCircle2 } from "lucide-react";

export default function PromotionalFeedback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const sessionId = searchParams.get('session');
  const userId = searchParams.get('user');
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    overallSatisfaction: "",
    mostHelpfulFeatures: [] as string[],
    improvementSuggestions: "",
    wouldRecommend: "",
    additionalComments: "",
  });

  useEffect(() => {
    // Check if already submitted
    const checkSubmission = async () => {
      if (!sessionId || !userId) return;

      const { data } = await supabase
        .from('promotional_feedback_reminders')
        .select('feedback_submitted')
        .eq('internship_session_id', sessionId)
        .eq('user_id', userId)
        .single();

      if (data?.feedback_submitted) {
        setSubmitted(true);
      }
    };

    checkSubmission();
  }, [sessionId, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionId || !userId) {
      toast({
        title: "Error",
        description: "Invalid feedback link",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Store feedback
      const { error: feedbackError } = await supabase
        .from('promotional_feedback_reminders')
        .update({
          feedback_submitted: true,
          feedback_submitted_at: new Date().toISOString(),
        })
        .eq('internship_session_id', sessionId)
        .eq('user_id', userId);

      if (feedbackError) throw feedbackError;

      // Store detailed feedback in a separate table (create if needed)
      // Or send to your analytics service

      setSubmitted(true);
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });

    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Thank You!</h2>
            <p className="text-muted-foreground">
              Your feedback has been submitted successfully. You've been entered into our gift card drawing!
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-amber-600" />
              <CardTitle>FIRST30 Feedback Survey</CardTitle>
            </div>
            <CardDescription>
              Help us improve Tuterra! Your feedback takes 3-5 minutes and you'll be entered to win a $50 Amazon gift card.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Overall Satisfaction */}
              <div className="space-y-3">
                <Label>Overall, how satisfied were you with your virtual internship experience?</Label>
                <RadioGroup 
                  value={formData.overallSatisfaction}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, overallSatisfaction: value }))}
                >
                  {['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="cursor-pointer">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Most Helpful Features */}
              <div className="space-y-3">
                <Label>Which features did you find most helpful? (Select all that apply)</Label>
                <div className="space-y-2">
                  {[
                    'AI Supervisor feedback',
                    'Realistic workplace tasks',
                    'Progress tracking',
                    'Skills development',
                    'Company profile details',
                    'Email messaging system',
                  ].map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature}
                        checked={formData.mostHelpfulFeatures.includes(feature)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              mostHelpfulFeatures: [...prev.mostHelpfulFeatures, feature]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              mostHelpfulFeatures: prev.mostHelpfulFeatures.filter(f => f !== feature)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={feature} className="cursor-pointer">{feature}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Suggestions */}
              <div className="space-y-3">
                <Label htmlFor="improvements">What could we improve?</Label>
                <Textarea
                  id="improvements"
                  value={formData.improvementSuggestions}
                  onChange={(e) => setFormData(prev => ({ ...prev, improvementSuggestions: e.target.value }))}
                  placeholder="Share your suggestions..."
                  rows={4}
                />
              </div>

              {/* Would Recommend */}
              <div className="space-y-3">
                <Label>Would you recommend Tuterra to other students?</Label>
                <RadioGroup 
                  value={formData.wouldRecommend}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, wouldRecommend: value }))}
                >
                  {['Definitely', 'Probably', 'Not Sure', 'Probably Not', 'Definitely Not'].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`recommend-${option}`} />
                      <Label htmlFor={`recommend-${option}`} className="cursor-pointer">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Additional Comments */}
              <div className="space-y-3">
                <Label htmlFor="comments">Any additional comments?</Label>
                <Textarea
                  id="comments"
                  value={formData.additionalComments}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalComments: e.target.value }))}
                  placeholder="Share anything else you'd like us to know..."
                  rows={4}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !formData.overallSatisfaction || !formData.wouldRecommend}
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
