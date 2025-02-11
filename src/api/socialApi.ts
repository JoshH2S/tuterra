
import { supabase } from "@/integrations/supabase/client";
import { StudyGroup, SharedResource } from "@/types/social";
import { toast } from "@/hooks/use-toast";

export const fetchMyStudyGroups = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // First fetch the study groups where the user is a member
    const { data: memberGroups, error: membershipError } = await supabase
      .from('study_group_members')
      .select('group_id')
      .eq('member_id', user.id);

    if (membershipError) {
      console.error('Error fetching memberships:', membershipError);
      toast({
        title: "Error",
        description: "Failed to fetch study group memberships. Please try again.",
        variant: "destructive",
      });
      throw membershipError;
    }

    const groupIds = memberGroups?.map(m => m.group_id) || [];

    if (groupIds.length === 0) {
      return [];
    }

    // Then fetch the full study group details
    const { data: groups, error: groupsError } = await supabase
      .from('study_groups')
      .select('*')
      .in('id', groupIds)
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

    // Fetch member counts in a single query
    const { data: memberCounts, error: countsError } = await supabase
      .from('study_group_members')
      .select('group_id, count')
      .in('group_id', groupIds)
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Fetch only resources that are either public (no study_group_id) 
    // or belong to groups the user is a member of
    const { data: memberGroups } = await supabase
      .from('study_group_members')
      .select('group_id')
      .eq('member_id', user.id);

    const groupIds = memberGroups?.map(m => m.group_id) || [];

    const { data: resources, error } = await supabase
      .from('shared_resources')
      .select('*')
      .or(`study_group_id.is.null,study_group_id.in.(${groupIds.join(',')})`)
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
