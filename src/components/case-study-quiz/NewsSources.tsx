
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, NewspaperIcon } from "lucide-react";

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
          <NewspaperIcon className="h-5 w-5" />
          News Sources Used
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {newsSources.map((source, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0">
              <div>
                <p className="font-medium">{source.title}</p>
                <p className="text-sm text-muted-foreground">{source.source}</p>
              </div>
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
