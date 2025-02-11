
export interface Forum {
  id: string;
  title: string;
  description: string | null;
  course_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ForumPost {
  id: string;
  forum_id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string | null;
  course_id: string | null;
  created_by: string;
  max_members: number;
  created_at: string;
  updated_at: string;
  current_members: number;
}

export interface SharedResource {
  id: string;
  title: string;
  description: string | null;
  file_path: string | null;
  url: string | null;
  resource_type: 'file' | 'link';
  shared_by: string;
  study_group_id: string | null;
  course_id: string | null;
  created_at: string;
  updated_at: string;
}
