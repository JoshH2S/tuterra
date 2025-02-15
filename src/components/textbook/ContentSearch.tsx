
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
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
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search through textbook content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isSearching}>
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </form>

      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.id} className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Relevance: {Math.round(result.similarity * 100)}%
              </p>
              <p className="text-gray-900">{result.chunk_text}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
