import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText, Clipboard, CheckCheck, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { InternshipResource } from "./SwipeableInternshipView";

interface ResourceDocumentProps {
  resource: InternshipResource;
  onBack: () => void;
}

export function ResourceDocument({ resource, onBack }: ResourceDocumentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (resource.content) {
      navigator.clipboard.writeText(resource.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-8 w-8" 
            onClick={onBack}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-xs"
            onClick={handleCopy}
            disabled={!resource.content || copied}
          >
            {copied ? (
              <>
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Clipboard className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
        
        <div className="flex items-center mt-2">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          <CardTitle className="text-lg">{resource.title}</CardTitle>
        </div>
        
        {resource.description && (
          <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto p-4">
        {resource.content ? (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>
              {resource.content}
            </ReactMarkdown>
          </div>
        ) : resource.link ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <p className="mb-4 text-muted-foreground">
              This resource is available at an external link:
            </p>
            <Button
              variant="default"
              onClick={() => window.open(resource.link, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-2"
            >
              Open Resource
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <p className="text-muted-foreground">No content available for this resource.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 