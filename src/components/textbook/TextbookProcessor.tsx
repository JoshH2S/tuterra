
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Book, Loader2 } from "lucide-react";

interface ProcessingStatus {
  file?: File;
  isUploading?: boolean;
  isProcessing?: boolean;
  error?: string;
}

export const TextbookProcessor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState<string>("chapter");
  const [status, setStatus] = useState<ProcessingStatus>({});

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const processTextbook = async () => {
    if (!selectedFile || !title) {
      toast({
        title: "Missing information",
        description: "Please provide both a file and a title",
        variant: "destructive",
      });
      return;
    }

    try {
      setStatus({ isUploading: true });

      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('textbooks')
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      setStatus({ isProcessing: true });

      // Process the uploaded file
      const { data: processingResult, error: processingError } = await supabase.functions
        .invoke('process-textbook', {
          body: {
            filePath,
            contentType,
            title,
          },
        });

      if (processingError) {
        throw new Error(`Failed to process textbook: ${processingError.message}`);
      }

      toast({
        title: "Success",
        description: "Textbook processed successfully",
      });

      // Reset form
      setSelectedFile(null);
      setTitle("");
      setStatus({});
    } catch (error) {
      console.error('Error processing textbook:', error);
      setStatus({ error: error.message });
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Process Textbook</CardTitle>
        <CardDescription>Upload a PDF textbook to process and generate AI summaries</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chapter">Chapter</SelectItem>
              <SelectItem value="section">Section</SelectItem>
              <SelectItem value="definition">Definition</SelectItem>
              <SelectItem value="formula">Formula</SelectItem>
              <SelectItem value="example">Example</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <label
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {selectedFile ? (
                <>
                  <Book className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="text-sm text-gray-500">{selectedFile.name}</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="text-sm text-gray-500">Click to upload PDF</p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileSelect}
            />
          </label>
        </div>

        <Button
          onClick={processTextbook}
          disabled={!selectedFile || !title || status.isUploading || status.isProcessing}
          className="w-full"
        >
          {(status.isUploading || status.isProcessing) ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {status.isUploading ? "Uploading..." : "Processing..."}
            </>
          ) : (
            "Process Textbook"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
