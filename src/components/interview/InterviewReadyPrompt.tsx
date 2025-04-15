
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface InterviewReadyPromptProps {
  jobTitle: string;
  onStartChat: () => void;
  usedFallbackQuestions?: boolean;
}

export const InterviewReadyPrompt = ({ 
  jobTitle, 
  onStartChat,
  usedFallbackQuestions = false
}: InterviewReadyPromptProps) => {
  return (
    <Card className="w-full mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl text-center md:text-2xl">
          Your Interview is Ready
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          We've prepared a simulated job interview for the <strong>{jobTitle}</strong> position.
        </p>
        
        {usedFallbackQuestions && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-amber-800 text-sm">
            <p>
              <strong>Note:</strong> We're using a set of standard questions for this role 
              since we couldn't generate custom ones at the moment. These are still relevant
              to your job title but may be less specific to your exact requirements.
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <h3 className="font-medium">Tips for a successful practice:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm md:text-base">
            <li>Answer as if you're in a real interview</li>
            <li>Take your time to think before responding</li>
            <li>Try to provide specific examples from your experience</li>
            <li>Speak clearly and confidently</li>
            <li>Keep your answers concise but comprehensive</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onStartChat}
          className="w-full py-5 text-base font-medium"
          size="lg"
        >
          Start Interview
        </Button>
      </CardFooter>
    </Card>
  );
};
