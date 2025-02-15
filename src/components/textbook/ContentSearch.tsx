
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Search, BookText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SearchResult {
  id: string;
  chunk_text: string;
  similarity: number;
  content_id: string;
  chunk_index: number;
}

export function ContentSearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('content-search', {
        body: { query, limit: 5 }
      });

      if (error) throw error;
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search through textbook content..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 w-full"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSearching}
            className="w-full sm:w-auto"
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Search
          </Button>
        </div>
      </form>

      {!results.length && !isSearching && (
        <div className="text-center py-8">
          <BookText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Enter your search query above to find relevant content</p>
        </div>
      )}

      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Relevance: {Math.round(result.similarity * 100)}%
                </span>
              </div>
              <p className="text-gray-900 leading-relaxed">{result.chunk_text}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
