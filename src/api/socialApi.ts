
import { supabase } from "@/integrations/supabase/client";
import { StudyGroup, SharedResource } from "@/types/social";

export const fetchMyStudyGroups = async () => {
  const { data: groups, error } = await supabase
    .from('study_groups')
    .select(`
      *,
      study_group_members!inner (
        member_id
      )
    `)
    .eq('study_group_members.member_id', (await supabase.auth.getUser()).data.user?.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return groups as StudyGroup[];
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
