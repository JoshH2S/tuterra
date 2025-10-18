import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TaskArtifact {
  id: string;
  title: string;
  description: string;
  skillTags: string[];
  taskId: string;
  submissionDate: string;
  fileUrl?: string;
  fileName?: string;
}

export function useTaskArtifacts(sessionId: string, userId: string) {
  const [artifacts, setArtifacts] = useState<TaskArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaskArtifacts = async () => {
      if (!sessionId || !userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch task submissions with task details
        const { data: submissions, error: submissionsError } = await supabase
          .from('internship_task_submissions')
          .select(`
            id,
            response_text,
            file_url,
            file_name,
            content_type,
            created_at,
            task_id,
            internship_tasks!inner (
              id,
              title,
              description,
              task_type
            )
          `)
          .eq('session_id', sessionId)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (submissionsError) {
          throw submissionsError;
        }

        // Transform submissions into artifacts
        const transformedArtifacts: TaskArtifact[] = (submissions || []).map((submission: any) => {
          const task = submission.internship_tasks;
          
          // Generate skill tags based on task type and content type
          const skillTags: string[] = [];
          
          if (task.task_type) {
            skillTags.push(task.task_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
          }
          
          if (submission.content_type) {
            switch (submission.content_type) {
              case 'text':
                skillTags.push('Written Communication');
                break;
              case 'file':
                skillTags.push('Document Creation');
                break;
              case 'presentation':
                skillTags.push('Presentation Skills');
                break;
              case 'analysis':
                skillTags.push('Analytical Thinking');
                break;
              default:
                skillTags.push('Problem Solving');
            }
          }

          // Create description from task description and response preview
          const responsePreview = submission.response_text 
            ? submission.response_text.substring(0, 100) + (submission.response_text.length > 100 ? '...' : '')
            : 'File submission';

          return {
            id: submission.id,
            title: task.title || 'Untitled Task',
            description: `${task.description || ''}\n\nSubmission: ${responsePreview}`,
            skillTags: [...new Set(skillTags)], // Remove duplicates
            taskId: submission.task_id,
            submissionDate: submission.created_at,
            fileUrl: submission.file_url,
            fileName: submission.file_name
          };
        });

        setArtifacts(transformedArtifacts);
      } catch (err) {
        console.error('Error fetching task artifacts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load artifacts');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskArtifacts();
  }, [sessionId, userId]);

  return { artifacts, loading, error };
}
