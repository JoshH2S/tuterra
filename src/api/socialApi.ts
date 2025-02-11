
import { supabase } from "@/integrations/supabase/client";
import { StudyGroup, SharedResource } from "@/types/social";
import { toast } from "@/hooks/use-toast";

export const fetchMyStudyGroups = async () => {
  try {
    // First fetch the study groups
    const { data: groups, error: groupsError } = await supabase
      .from('study_groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (groupsError) {
      console.error('Error fetching study groups:', groupsError);
      toast({
        title: "Error",
        description: "Failed to fetch study groups. Please try again.",
        variant: "destructive",
      });
      throw groupsError;
    }

    // Then fetch the member counts for these groups
    const { data: memberCounts, error: countsError } = await supabase
      .from('study_group_members')
      .select('group_id, count')
      .in('group_id', groups?.map(g => g.id) || [])
      .select('group_id, count(*)')
      .group('group_id');

    if (countsError) {
      console.error('Error fetching member counts:', countsError);
      toast({
        title: "Error",
        description: "Failed to fetch group member counts. Please try again.",
        variant: "destructive",
      });
      throw countsError;
    }

    // Create a map of group ID to member count
    const countMap = new Map(
      memberCounts?.map(({ group_id, count }) => [group_id, parseInt(count)])
    );

    // Combine the data
    const transformedGroups = groups?.map(group => ({
      ...group,
      current_members: countMap.get(group.id) || 0
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

