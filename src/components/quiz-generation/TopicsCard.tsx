
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { TopicInput } from "./TopicInput";
import { Topic } from "@/hooks/useQuizGeneration";

interface TopicsCardProps {
  topics: Topic[];
  onTopicChange: (index: number, field: keyof Topic, value: string | number) => void;
  onAddTopic: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
  isSubmitDisabled: boolean;
}

export const TopicsCard = ({
  topics,
  onTopicChange,
  onAddTopic,
  onSubmit,
  isProcessing,
  isSubmitDisabled
}: TopicsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Topics</CardTitle>
        <CardDescription>Define topics and number of questions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {topics.map((topic, index) => (
          <TopicInput
            key={index}
            topic={topic}
            index={index}
            onChange={onTopicChange}
          />
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={onAddTopic}
          className="w-full"
        >
          Add Another Topic
        </Button>

        <Button
          type="button"
          onClick={onSubmit}
          className="w-full"
          disabled={isSubmitDisabled}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Quiz...
            </>
          ) : (
            'Generate Quiz'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
