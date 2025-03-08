
import { StepHeader } from "@/components/quiz-generation/StepHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/quiz-generation/EmptyState";

interface NewsSource {
  title: string;
  source: string;
  url: string;
}

interface NewsSourcesStepProps {
  newsSources: NewsSource[];
}

export const NewsSourcesStep = ({ newsSources }: NewsSourcesStepProps) => {
  return (
    <div className="space-y-6">
      <StepHeader
        title="News Sources"
        description="Review the sources that will be used for case studies"
        icon={Newspaper}
      />

      {newsSources.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center">
            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              {newsSources.length} Source{newsSources.length !== 1 ? 's' : ''} Found
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {newsSources.map((source, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{source.title}</CardTitle>
                  <CardDescription className="text-xs">{source.source}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="outline" className="text-xs">News Article</Badge>
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:text-primary/80 inline-flex items-center text-xs"
                    >
                      View Source <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Newspaper}
              title="Sources Will Appear Here"
              description="Sources will be searched once you proceed to generate your quiz"
              action={null}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
