
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsSource {
  title: string;
  source: string;
  url: string;
}

interface NewsSourcesProps {
  newsSources: NewsSource[];
}

export const NewsSources = ({ newsSources }: NewsSourcesProps) => {
  if (newsSources.length === 0) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          News Sources Used
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {newsSources.map((source, index) => (
            <div 
              key={index} 
              className="p-3 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <h3 className="font-medium">{source.title}</h3>
                  <p className="text-sm text-muted-foreground">{source.source}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="w-full sm:w-auto mt-2 sm:mt-0 touch-manipulation"
                >
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1"
                  >
                    View Source <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
