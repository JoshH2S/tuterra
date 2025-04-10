
import { useState } from "react";

interface NewsSource {
  title: string;
  source: string;
  url: string;
}

export const useNewsSourcesState = () => {
  const [newsSources, setNewsSources] = useState<NewsSource[]>([]);
  
  return {
    newsSources,
    setNewsSources
  };
};
