
import { supabase } from "@/integrations/supabase/client";
import { StudyGroup, SharedResource } from "@/types/social";
import { toast } from "@/hooks/use-toast";

export const fetchMyStudyGroups = async () => {
  try {
    const { data: groups, error } = await supabase
      .from('study_groups')
      .select(`
        *,
        study_group_members!study_group_members_group_id_fkey (
          count
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching study groups:', error);
      toast({
        title: "Error",
        description: "Failed to fetch study groups. Please try again.",
        variant: "destructive",
      });
      throw error;
    }

    // Transform the data to include the current_members count
    const transformedGroups = groups.map(group => ({
      ...group,
      current_members: group.study_group_members[0]?.count || 0
    }));

    return transformedGroups as StudyGroup[];
  } catch (error) {
    console.error('Error in fetchMyStudyGroups:', error);
    throw error;
  }
};

export const fetchLatestResources = async () => {
  try {
    const { data: resources, error } = await supabase
      .from('shared_resources')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shared resources. Please try again.",
        variant: "destructive",
      });
      throw error;
    }

    return resources as SharedResource[];
  } catch (error) {
    console.error('Error in fetchLatestResources:', error);
    throw error;
  }
};
