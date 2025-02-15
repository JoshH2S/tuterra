
import { TextbookProcessor } from "@/components/textbook/TextbookProcessor";
import { ContentSearch } from "@/components/textbook/ContentSearch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TextbookProcessing = () => {
  return (
    <div className="container mx-auto py-4 px-4 sm:py-8 sm:px-6">
      <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">Textbook Processing</h1>
      
      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="upload">Upload & Process</TabsTrigger>
          <TabsTrigger value="search">Search Content</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Textbook</h2>
            <TextbookProcessor />
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Search Content</h2>
            <ContentSearch />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TextbookProcessing;
