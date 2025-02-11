
import { supabase } from "@/integrations/supabase/client";
import { StudyGroup, SharedResource } from "@/types/social";

export const fetchMyStudyGroups = async () => {
  const { data: groups, error } = await supabase
    .from('study_groups')
    .select(`
      *,
      study_group_members!study_group_members_group_id_fkey (
        count
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Transform the data to include the current_members count
  const transformedGroups = groups.map(group => ({
    ...group,
    current_members: group.study_group_members[0]?.count || 0
  }));

  return transformedGroups as StudyGroup[];
};

export const fetchLatestResources = async () => {
  const { data: resources, error } = await supabase
    .from('shared_resources')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) throw error;
  return resources as SharedResource[];
};
