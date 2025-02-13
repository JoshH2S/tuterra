
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CourseMaterial } from "@/types/course";

export const useTutorMaterials = (courseId: string) => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const { data, error } = await supabase
          .from('course_materials')
          .select('*')
          .eq('course_id', courseId);

        if (error) throw error;
        setMaterials(data || []);
      } catch (error) {
        console.error('Error fetching materials:', error);
        toast({
          title: "Error",
          description: "Failed to load course materials",
          variant: "destructive",
        });
      }
    };

    if (courseId) {
      fetchMaterials();
    }
  }, [courseId, toast]);

  return {
    materials,
    selectedMaterial,
    setSelectedMaterial,
  };
};
