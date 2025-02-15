
import { TextbookProcessor } from "@/components/textbook/TextbookProcessor";
import { ContentSearch } from "@/components/textbook/ContentSearch";
import { Separator } from "@/components/ui/separator";

const TextbookProcessing = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Textbook Processing</h1>
      
      <div className="space-y-6">
        <TextbookProcessor />
        <Separator className="my-8" />
        <div>
          <h2 className="text-2xl font-semibold mb-4">Search Content</h2>
          <ContentSearch />
        </div>
      </div>
    </div>
  );
};

export default TextbookProcessing;
