
import { lazy, Suspense, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the RichTextEditor component
const RichTextEditor = lazy(() => import('@/components/editor/RichTextEditor').then(
  module => ({ default: module.RichTextEditor })
));

interface LazyRichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function LazyRichTextEditor({ content, onChange }: LazyRichTextEditorProps) {
  // Local state to handle content while the editor is loading
  const [localContent, setLocalContent] = useState(content);
  
  const handleChange = (newContent: string) => {
    setLocalContent(newContent);
    onChange(newContent);
  };
  
  return (
    <Suspense 
      fallback={
        <div className="border rounded-lg">
          <div className="border-b p-2">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="p-4">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      }
    >
      <RichTextEditor content={localContent} onChange={handleChange} />
    </Suspense>
  );
}
