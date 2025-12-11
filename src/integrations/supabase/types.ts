export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievement_definitions: {
        Row: {
          created_at: string | null
          description: string
          icon: string
          id: string
          key: string
          requirements: Json
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description: string
          icon: string
          id?: string
          key: string
          requirements: Json
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          key?: string
          requirements?: Json
          title?: string
          type?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          activity_type: string
          course_id: string | null
          created_at: string
          description: string
          id: string
          metadata: Json | null
          student_id: string
        }
        Insert: {
          activity_type: string
          course_id?: string | null
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          student_id: string
        }
        Update: {
          activity_type?: string
          course_id?: string | null
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          student_id?: string
        }
        Relationships: []
      }
      answer_feedback: {
        Row: {
          created_at: string | null
          feedback: string
          id: string
          question_id: string | null
          score: number | null
        }
        Insert: {
          created_at?: string | null
          feedback: string
          id?: string
          question_id?: string | null
          score?: number | null
        }
        Update: {
          created_at?: string | null
          feedback?: string
          id?: string
          question_id?: string | null
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "answer_feedback_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "interview_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      app_config: {
        Row: {
          created_at: string | null
          description: string | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      assessment_analytics: {
        Row: {
          created_at: string
          generation_time: number | null
          id: string
          model_used: string | null
          token_usage: number | null
          user_id: string
          user_tier: string
        }
        Insert: {
          created_at?: string
          generation_time?: number | null
          id?: string
          model_used?: string | null
          token_usage?: number | null
          user_id: string
          user_tier: string
        }
        Update: {
          created_at?: string
          generation_time?: number | null
          id?: string
          model_used?: string | null
          token_usage?: number | null
          user_id?: string
          user_tier?: string
        }
        Relationships: []
      }
      assessment_question_responses: {
        Row: {
          ai_analysis: Json | null
          created_at: string | null
          feedback: string | null
          id: string
          question_index: number
          question_type: string
          result_id: string
          score: number | null
          user_response: Json
        }
        Insert: {
          ai_analysis?: Json | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          question_index: number
          question_type: string
          result_id: string
          score?: number | null
          user_response: Json
        }
        Update: {
          ai_analysis?: Json | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          question_index?: number
          question_type?: string
          result_id?: string
          score?: number | null
          user_response?: Json
        }
        Relationships: [
          {
            foreignKeyName: "assessment_question_responses_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "skill_assessment_results"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_scenarios: {
        Row: {
          assessment_id: string
          background_context: Json | null
          created_at: string | null
          id: string
          scenario_content: string
          scenario_title: string
          supporting_materials: Json | null
        }
        Insert: {
          assessment_id: string
          background_context?: Json | null
          created_at?: string | null
          id?: string
          scenario_content: string
          scenario_title: string
          supporting_materials?: Json | null
        }
        Update: {
          assessment_id?: string
          background_context?: Json | null
          created_at?: string | null
          id?: string
          scenario_content?: string
          scenario_title?: string
          supporting_materials?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_scenarios_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "skill_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          feedback: string | null
          grade: number | null
          graded_at: string | null
          id: string
          student_id: string
          submission_url: string | null
          submitted_at: string
        }
        Insert: {
          assignment_id: string
          feedback?: string | null
          grade?: number | null
          graded_at?: string | null
          id?: string
          student_id: string
          submission_url?: string | null
          submitted_at?: string
        }
        Update: {
          assignment_id?: string
          feedback?: string | null
          grade?: number | null
          graded_at?: string | null
          id?: string
          student_id?: string
          submission_url?: string | null
          submitted_at?: string
        }
        Relationships: []
      }
      cached_assessments: {
        Row: {
          assessment_data: Json
          cache_key: string
          cached_until: string
          created_at: string
          generation_time: number | null
          id: string
          model_used: string | null
        }
        Insert: {
          assessment_data: Json
          cache_key: string
          cached_until: string
          created_at?: string
          generation_time?: number | null
          id?: string
          model_used?: string | null
        }
        Update: {
          assessment_data?: Json
          cache_key?: string
          cached_until?: string
          created_at?: string
          generation_time?: number | null
          id?: string
          model_used?: string | null
        }
        Relationships: []
      }
      content_chunks: {
        Row: {
          chunk_index: number
          chunk_text: string
          content_id: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          chunk_index: number
          chunk_text: string
          content_id: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          chunk_index?: number
          chunk_text?: string
          content_id?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "content_chunks_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "processed_textbook_content"
            referencedColumns: ["id"]
          },
        ]
      }
      course_materials: {
        Row: {
          course_id: string
          created_at: string
          file_name: string
          file_type: string
          id: string
          size: number
          storage_path: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          file_name: string
          file_type: string
          id?: string
          size: number
          storage_path: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          file_name?: string
          file_type?: string
          id?: string
          size?: number
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_templates: {
        Row: {
          content: Json
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_templates_teacher_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          email_type: string
          error_message: string | null
          id: string
          success: boolean
          timestamp: string
          user_id: string
        }
        Insert: {
          email_type: string
          error_message?: string | null
          id?: string
          success: boolean
          timestamp?: string
          user_id: string
        }
        Update: {
          email_type?: string
          error_message?: string | null
          id?: string
          success?: boolean
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          forum_id: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          forum_id: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          forum_id?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
            referencedColumns: ["id"]
          },
        ]
      }
      forums: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gratitude_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          prompt_id: string | null
          shared_to_group: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          prompt_id?: string | null
          shared_to_group?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          prompt_id?: string | null
          shared_to_group?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gratitude_entries_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "gratitude_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      gratitude_prompts: {
        Row: {
          category: string
          created_at: string
          id: string
          is_daily: boolean | null
          is_weekly: boolean | null
          prompt_text: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_daily?: boolean | null
          is_weekly?: boolean | null
          prompt_text: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_daily?: boolean | null
          is_weekly?: boolean | null
          prompt_text?: string
        }
        Relationships: []
      }
      internship_company_applications: {
        Row: {
          application_sent: boolean | null
          company_name: string
          company_url: string | null
          completed: boolean | null
          cover_letter: string | null
          created_at: string | null
          id: string
          position: string
          research_notes: string | null
          session_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_sent?: boolean | null
          company_name: string
          company_url?: string | null
          completed?: boolean | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          position: string
          research_notes?: string | null
          session_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_sent?: boolean | null
          company_name?: string
          company_url?: string | null
          completed?: boolean | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          position?: string
          research_notes?: string | null
          session_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_company_applications_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_company_details: {
        Row: {
          created_at: string | null
          description: string | null
          founded_year: number | null
          id: string
          industry: string
          mission: string | null
          name: string
          session_id: string
          size: string | null
          updated_at: string | null
          values: Json | null
          vision: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          industry: string
          mission?: string | null
          name: string
          session_id: string
          size?: string | null
          updated_at?: string | null
          values?: Json | null
          vision?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          industry?: string
          mission?: string | null
          name?: string
          session_id?: string
          size?: string | null
          updated_at?: string | null
          values?: Json | null
          vision?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_company_details_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_company_profiles: {
        Row: {
          background_story: string
          ceo_bio: string | null
          ceo_name: string | null
          clients_or_products: string
          company_logo_url: string | null
          company_mission: string
          company_name: string
          company_overview: string
          company_size: string | null
          company_tagline: string | null
          company_values: string
          company_vision: string | null
          created_at: string | null
          departments: string[] | null
          error_message: string | null
          founded_year: string | null
          headquarters_location: string
          id: string
          industry: string
          intern_department: string | null
          intern_expectations: string[] | null
          notable_clients: string[] | null
          profile_status: string | null
          sample_projects: string[] | null
          session_id: string
          supervisor_name: string
          target_market: string | null
          team_members: Json | null
          team_structure: string
          tools_technologies: string[] | null
          updated_at: string | null
        }
        Insert: {
          background_story: string
          ceo_bio?: string | null
          ceo_name?: string | null
          clients_or_products: string
          company_logo_url?: string | null
          company_mission: string
          company_name: string
          company_overview: string
          company_size?: string | null
          company_tagline?: string | null
          company_values: string
          company_vision?: string | null
          created_at?: string | null
          departments?: string[] | null
          error_message?: string | null
          founded_year?: string | null
          headquarters_location: string
          id?: string
          industry: string
          intern_department?: string | null
          intern_expectations?: string[] | null
          notable_clients?: string[] | null
          profile_status?: string | null
          sample_projects?: string[] | null
          session_id: string
          supervisor_name: string
          target_market?: string | null
          team_members?: Json | null
          team_structure: string
          tools_technologies?: string[] | null
          updated_at?: string | null
        }
        Update: {
          background_story?: string
          ceo_bio?: string | null
          ceo_name?: string | null
          clients_or_products?: string
          company_logo_url?: string | null
          company_mission?: string
          company_name?: string
          company_overview?: string
          company_size?: string | null
          company_tagline?: string | null
          company_values?: string
          company_vision?: string | null
          created_at?: string | null
          departments?: string[] | null
          error_message?: string | null
          founded_year?: string | null
          headquarters_location?: string
          id?: string
          industry?: string
          intern_department?: string | null
          intern_expectations?: string[] | null
          notable_clients?: string[] | null
          profile_status?: string | null
          sample_projects?: string[] | null
          session_id?: string
          supervisor_name?: string
          target_market?: string | null
          team_members?: Json | null
          team_structure?: string
          tools_technologies?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_company_profiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_completion_evaluations: {
        Row: {
          areas_of_excellence: string
          certificate_text: string
          created_at: string | null
          generation_status: string | null
          id: string
          improvement_suggestions: string | null
          overall_assessment: string
          session_id: string
          skills_gained: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          areas_of_excellence: string
          certificate_text: string
          created_at?: string | null
          generation_status?: string | null
          id?: string
          improvement_suggestions?: string | null
          overall_assessment: string
          session_id: string
          skills_gained: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          areas_of_excellence?: string
          certificate_text?: string
          created_at?: string | null
          generation_status?: string | null
          id?: string
          improvement_suggestions?: string | null
          overall_assessment?: string
          session_id?: string
          skills_gained?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_completion_evaluations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_deliverables: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          content: string
          id: string
          submitted_at: string
          task_id: string
          user_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          content: string
          id?: string
          submitted_at?: string
          task_id: string
          user_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          content?: string
          id?: string
          submitted_at?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_deliverables_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "internship_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_events: {
        Row: {
          date: string
          id: string
          session_id: string | null
          title: string
          type: string
        }
        Insert: {
          date: string
          id?: string
          session_id?: string | null
          title: string
          type: string
        }
        Update: {
          date?: string
          id?: string
          session_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_feedback: {
        Row: {
          collaboration_rating: number
          created_at: string
          deliverable_id: string | null
          feedback_text: string
          id: string
          quality_rating: number
          session_id: string
          task_title: string
          timeliness_rating: number
          user_id: string
        }
        Insert: {
          collaboration_rating: number
          created_at?: string
          deliverable_id?: string | null
          feedback_text: string
          id?: string
          quality_rating: number
          session_id: string
          task_title: string
          timeliness_rating: number
          user_id: string
        }
        Update: {
          collaboration_rating?: number
          created_at?: string
          deliverable_id?: string | null
          feedback_text?: string
          id?: string
          quality_rating?: number
          session_id?: string
          task_title?: string
          timeliness_rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_feedback_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "internship_deliverables"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_feedback_details: {
        Row: {
          areas_for_improvement: string | null
          collaboration_score: number | null
          created_at: string | null
          generation_status: string | null
          id: string
          overall_assessment: string | null
          quality_score: number | null
          specific_comments: string | null
          strengths: string | null
          submission_id: string
          timeliness_score: number | null
          updated_at: string | null
        }
        Insert: {
          areas_for_improvement?: string | null
          collaboration_score?: number | null
          created_at?: string | null
          generation_status?: string | null
          id?: string
          overall_assessment?: string | null
          quality_score?: number | null
          specific_comments?: string | null
          strengths?: string | null
          submission_id: string
          timeliness_score?: number | null
          updated_at?: string | null
        }
        Update: {
          areas_for_improvement?: string | null
          collaboration_score?: number | null
          created_at?: string | null
          generation_status?: string | null
          id?: string
          overall_assessment?: string | null
          quality_score?: number | null
          specific_comments?: string | null
          strengths?: string | null
          submission_id?: string
          timeliness_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_feedback_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "internship_task_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_final_submissions: {
        Row: {
          created_at: string | null
          external_link: string | null
          file_url: string | null
          id: string
          reflection: string | null
          session_id: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          external_link?: string | null
          file_url?: string | null
          id?: string
          reflection?: string | null
          session_id: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          external_link?: string | null
          file_url?: string | null
          id?: string
          reflection?: string | null
          session_id?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_final_submissions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_messages: {
        Row: {
          body: string | null
          content: string | null
          id: string
          is_read: boolean | null
          related_task_id: string | null
          sender: string | null
          sender_avatar_url: string | null
          sender_name: string | null
          sent_at: string | null
          session_id: string | null
          subject: string | null
          timestamp: string | null
        }
        Insert: {
          body?: string | null
          content?: string | null
          id?: string
          is_read?: boolean | null
          related_task_id?: string | null
          sender?: string | null
          sender_avatar_url?: string | null
          sender_name?: string | null
          sent_at?: string | null
          session_id?: string | null
          subject?: string | null
          timestamp?: string | null
        }
        Update: {
          body?: string | null
          content?: string | null
          id?: string
          is_read?: boolean | null
          related_task_id?: string | null
          sender?: string | null
          sender_avatar_url?: string | null
          sender_name?: string | null
          sent_at?: string | null
          session_id?: string | null
          subject?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_messages_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "internship_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internship_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_messages_v2: {
        Row: {
          content: string
          context_data: Json | null
          created_at: string
          id: string
          message_id: string | null
          sender_avatar_style: string | null
          sender_department: string | null
          sender_id: string | null
          sender_name: string
          sender_role: string | null
          sender_type: string
          sent_at: string
          session_id: string
          status: string
          subject: string | null
          user_id: string
        }
        Insert: {
          content: string
          context_data?: Json | null
          created_at?: string
          id?: string
          message_id?: string | null
          sender_avatar_style?: string | null
          sender_department?: string | null
          sender_id?: string | null
          sender_name: string
          sender_role?: string | null
          sender_type: string
          sent_at?: string
          session_id: string
          status?: string
          subject?: string | null
          user_id: string
        }
        Update: {
          content?: string
          context_data?: Json | null
          created_at?: string
          id?: string
          message_id?: string | null
          sender_avatar_style?: string | null
          sender_department?: string | null
          sender_id?: string | null
          sender_name?: string
          sender_role?: string | null
          sender_type?: string
          sent_at?: string
          session_id?: string
          status?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_messages_v2_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_portfolio_data: {
        Row: {
          created_at: string | null
          id: string
          reflection_essay: string | null
          session_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reflection_essay?: string | null
          session_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reflection_essay?: string | null
          session_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_portfolio_data_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_progress: {
        Row: {
          ai_feedback: string | null
          created_at: string
          id: string
          phase_number: number
          session_id: string
          user_id: string
          user_responses: Json
        }
        Insert: {
          ai_feedback?: string | null
          created_at?: string
          id?: string
          phase_number?: number
          session_id: string
          user_id: string
          user_responses?: Json
        }
        Update: {
          ai_feedback?: string | null
          created_at?: string
          id?: string
          phase_number?: number
          session_id?: string
          user_id?: string
          user_responses?: Json
        }
        Relationships: [
          {
            foreignKeyName: "internship_progress_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_resources: {
        Row: {
          content: string | null
          description: string | null
          id: string
          link: string
          session_id: string | null
          title: string
          type: string
        }
        Insert: {
          content?: string | null
          description?: string | null
          id?: string
          link: string
          session_id?: string | null
          title: string
          type: string
        }
        Update: {
          content?: string | null
          description?: string | null
          id?: string
          link?: string
          session_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_resources_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_responses: {
        Row: {
          auto_response_generated: boolean | null
          content: string
          created_at: string
          escalation_reason: string | null
          id: string
          message_id: string
          processed: boolean
          processing_status: string | null
          received_at: string
          reply_to_name: string
          reply_to_type: string
          session_id: string
          user_id: string
        }
        Insert: {
          auto_response_generated?: boolean | null
          content: string
          created_at?: string
          escalation_reason?: string | null
          id?: string
          message_id: string
          processed?: boolean
          processing_status?: string | null
          received_at?: string
          reply_to_name: string
          reply_to_type: string
          session_id: string
          user_id: string
        }
        Update: {
          auto_response_generated?: boolean | null
          content?: string
          created_at?: string
          escalation_reason?: string | null
          id?: string
          message_id?: string
          processed?: boolean
          processing_status?: string | null
          received_at?: string
          reply_to_name?: string
          reply_to_type?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_responses_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "internship_messages_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internship_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_sessions: {
        Row: {
          created_at: string
          current_phase: number
          duration_weeks: number | null
          id: string
          industry: string
          is_completed: boolean | null
          is_promotional: boolean | null
          job_description: string | null
          job_title: string
          metadata: Json | null
          promo_code: string | null
          questions: Json | null
          start_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_phase?: number
          duration_weeks?: number | null
          id?: string
          industry: string
          is_completed?: boolean | null
          is_promotional?: boolean | null
          job_description?: string | null
          job_title: string
          metadata?: Json | null
          promo_code?: string | null
          questions?: Json | null
          start_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_phase?: number
          duration_weeks?: number | null
          id?: string
          industry?: string
          is_completed?: boolean | null
          is_promotional?: boolean | null
          job_description?: string | null
          job_title?: string
          metadata?: Json | null
          promo_code?: string | null
          questions?: Json | null
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      internship_settings: {
        Row: {
          banner_url: string | null
          created_at: string | null
          id: string
          session_id: string
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          id?: string
          session_id: string
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          id?: string
          session_id?: string
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_settings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_supervisor_interactions: {
        Row: {
          context_snapshot: Json | null
          created_at: string | null
          id: string
          interaction_type: string
          message_id: string | null
          session_id: string | null
          trigger_event: string | null
          user_id: string | null
        }
        Insert: {
          context_snapshot?: Json | null
          created_at?: string | null
          id?: string
          interaction_type: string
          message_id?: string | null
          session_id?: string | null
          trigger_event?: string | null
          user_id?: string | null
        }
        Update: {
          context_snapshot?: Json | null
          created_at?: string | null
          id?: string
          interaction_type?: string
          message_id?: string | null
          session_id?: string | null
          trigger_event?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_supervisor_interactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "internship_inbox_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internship_supervisor_interactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "internship_supervisor_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internship_supervisor_interactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_supervisor_messages: {
        Row: {
          context_data: Json | null
          created_at: string | null
          direction: string
          generated_by: string | null
          id: string
          idem_key: string | null
          is_read: boolean | null
          message_content: string
          message_type: string
          meta: Json | null
          prompt_version: string | null
          scheduled_for: string | null
          sender_persona: Json | null
          sender_type: string
          sent_at: string | null
          session_id: string | null
          status: string | null
          subject: string | null
          thread_id: string | null
          user_id: string | null
        }
        Insert: {
          context_data?: Json | null
          created_at?: string | null
          direction?: string
          generated_by?: string | null
          id?: string
          idem_key?: string | null
          is_read?: boolean | null
          message_content: string
          message_type: string
          meta?: Json | null
          prompt_version?: string | null
          scheduled_for?: string | null
          sender_persona?: Json | null
          sender_type?: string
          sent_at?: string | null
          session_id?: string | null
          status?: string | null
          subject?: string | null
          thread_id?: string | null
          user_id?: string | null
        }
        Update: {
          context_data?: Json | null
          created_at?: string | null
          direction?: string
          generated_by?: string | null
          id?: string
          idem_key?: string | null
          is_read?: boolean | null
          message_content?: string
          message_type?: string
          meta?: Json | null
          prompt_version?: string | null
          scheduled_for?: string | null
          sender_persona?: Json | null
          sender_type?: string
          sent_at?: string | null
          session_id?: string | null
          status?: string | null
          subject?: string | null
          thread_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_supervisor_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_supervisor_state: {
        Row: {
          activity_streak_last_checked: number | null
          communication_style: Json | null
          created_at: string | null
          id: string
          last_check_in_at: string | null
          last_interaction_at: string | null
          last_known_completed_tasks: number | null
          last_known_task_count: number | null
          missed_deadlines_count: number | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          overdue_tasks_notified: Json | null
          session_id: string | null
          supervisor_name: string | null
          supervisor_role: string | null
          total_interactions: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activity_streak_last_checked?: number | null
          communication_style?: Json | null
          created_at?: string | null
          id?: string
          last_check_in_at?: string | null
          last_interaction_at?: string | null
          last_known_completed_tasks?: number | null
          last_known_task_count?: number | null
          missed_deadlines_count?: number | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          overdue_tasks_notified?: Json | null
          session_id?: string | null
          supervisor_name?: string | null
          supervisor_role?: string | null
          total_interactions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activity_streak_last_checked?: number | null
          communication_style?: Json | null
          created_at?: string | null
          id?: string
          last_check_in_at?: string | null
          last_interaction_at?: string | null
          last_known_completed_tasks?: number | null
          last_known_task_count?: number | null
          missed_deadlines_count?: number | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          overdue_tasks_notified?: Json | null
          session_id?: string | null
          supervisor_name?: string | null
          supervisor_role?: string | null
          total_interactions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_supervisor_state_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_supervisor_templates: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          prompt_template: string
          template_name: string
          template_type: string
          variables: Json | null
          version: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          prompt_template: string
          template_name: string
          template_type: string
          variables?: Json | null
          version?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          prompt_template?: string
          template_name?: string
          template_type?: string
          variables?: Json | null
          version?: string | null
        }
        Relationships: []
      }
      internship_task_details: {
        Row: {
          background: string
          created_at: string | null
          deliverables: string
          generated_by: string | null
          generation_status: string | null
          id: string
          instructions: string
          resources: string | null
          success_criteria: string
          task_id: string
          updated_at: string | null
        }
        Insert: {
          background: string
          created_at?: string | null
          deliverables: string
          generated_by?: string | null
          generation_status?: string | null
          id?: string
          instructions: string
          resources?: string | null
          success_criteria: string
          task_id: string
          updated_at?: string | null
        }
        Update: {
          background?: string
          created_at?: string | null
          deliverables?: string
          generated_by?: string | null
          generation_status?: string | null
          id?: string
          instructions?: string
          resources?: string | null
          success_criteria?: string
          task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_task_details_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "internship_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_task_resources: {
        Row: {
          content: string | null
          created_at: string | null
          external_url: string | null
          file_url: string | null
          generation_status: string | null
          id: string
          resource_type: string
          task_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          external_url?: string | null
          file_url?: string | null
          generation_status?: string | null
          id?: string
          resource_type: string
          task_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          external_url?: string | null
          file_url?: string | null
          generation_status?: string | null
          id?: string
          resource_type?: string
          task_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_task_resources_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "internship_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_task_submissions: {
        Row: {
          collaboration_rating: number | null
          content_type: string | null
          created_at: string | null
          feedback_provided_at: string | null
          feedback_text: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_featured_evidence: boolean | null
          overall_assessment: string | null
          quality_rating: number | null
          response_text: string
          session_id: string
          skill_analysis: Json | null
          skills_earned: Json | null
          status: string | null
          task_id: string
          timeliness_rating: number | null
          user_id: string
        }
        Insert: {
          collaboration_rating?: number | null
          content_type?: string | null
          created_at?: string | null
          feedback_provided_at?: string | null
          feedback_text?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_featured_evidence?: boolean | null
          overall_assessment?: string | null
          quality_rating?: number | null
          response_text: string
          session_id: string
          skill_analysis?: Json | null
          skills_earned?: Json | null
          status?: string | null
          task_id: string
          timeliness_rating?: number | null
          user_id: string
        }
        Update: {
          collaboration_rating?: number | null
          content_type?: string | null
          created_at?: string | null
          feedback_provided_at?: string | null
          feedback_text?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_featured_evidence?: boolean | null
          overall_assessment?: string | null
          quality_rating?: number | null
          response_text?: string
          session_id?: string
          skill_analysis?: Json | null
          skills_earned?: Json | null
          status?: string | null
          task_id?: string
          timeliness_rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_task_submissions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internship_task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "internship_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internship_task_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_tasks: {
        Row: {
          created_at: string
          description: string
          due_date: string
          id: string
          instructions: string | null
          session_id: string
          status: string
          task_order: number
          task_type: string | null
          title: string
          visible_after: string | null
        }
        Insert: {
          created_at?: string
          description: string
          due_date: string
          id?: string
          instructions?: string | null
          session_id: string
          status?: string
          task_order: number
          task_type?: string | null
          title: string
          visible_after?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          instructions?: string | null
          session_id?: string
          status?: string
          task_order?: number
          task_type?: string | null
          title?: string
          visible_after?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_tasks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_team_message_templates: {
        Row: {
          active: boolean | null
          context_requirements: Json | null
          created_at: string | null
          department: string | null
          id: string
          prompt_template: string
          sender_role_pattern: string
          template_name: string
          template_type: string
          timing_rules: Json | null
        }
        Insert: {
          active?: boolean | null
          context_requirements?: Json | null
          created_at?: string | null
          department?: string | null
          id?: string
          prompt_template: string
          sender_role_pattern: string
          template_name: string
          template_type: string
          timing_rules?: Json | null
        }
        Update: {
          active?: boolean | null
          context_requirements?: Json | null
          created_at?: string | null
          department?: string | null
          id?: string
          prompt_template?: string
          sender_role_pattern?: string
          template_name?: string
          template_type?: string
          timing_rules?: Json | null
        }
        Relationships: []
      }
      internship_team_schedules: {
        Row: {
          context_data: Json | null
          created_at: string | null
          id: string
          interaction_type: string
          scheduled_for: string
          sent_at: string | null
          session_id: string
          status: string | null
          team_member_data: Json
          user_id: string
        }
        Insert: {
          context_data?: Json | null
          created_at?: string | null
          id?: string
          interaction_type: string
          scheduled_for: string
          sent_at?: string | null
          session_id: string
          status?: string | null
          team_member_data: Json
          user_id: string
        }
        Update: {
          context_data?: Json | null
          created_at?: string | null
          id?: string
          interaction_type?: string
          scheduled_for?: string
          sent_at?: string | null
          session_id?: string
          status?: string | null
          team_member_data?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_team_schedules_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_user_replies: {
        Row: {
          created_at: string | null
          id: string
          original_message_id: string
          reply_content: string
          reply_type: string | null
          response_sentiment: string | null
          session_id: string
          triggered_followup: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          original_message_id: string
          reply_content: string
          reply_type?: string | null
          response_sentiment?: string | null
          session_id: string
          triggered_followup?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          original_message_id?: string
          reply_content?: string
          reply_type?: string | null
          response_sentiment?: string | null
          session_id?: string
          triggered_followup?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_user_replies_original_message_id_fkey"
            columns: ["original_message_id"]
            isOneToOne: false
            referencedRelation: "internship_inbox_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internship_user_replies_original_message_id_fkey"
            columns: ["original_message_id"]
            isOneToOne: false
            referencedRelation: "internship_supervisor_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internship_user_replies_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_feedback: {
        Row: {
          created_at: string
          id: string
          overall_feedback: string | null
          session_id: string | null
          strengths: string[] | null
          tips: string[] | null
          weaknesses: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          overall_feedback?: string | null
          session_id?: string | null
          strengths?: string[] | null
          tips?: string[] | null
          weaknesses?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          overall_feedback?: string | null
          session_id?: string | null
          strengths?: string[] | null
          tips?: string[] | null
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_questions: {
        Row: {
          created_at: string
          id: string
          question: string
          question_order: number
          session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          question: string
          question_order: number
          session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          question?: string
          question_order?: number
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_responses: {
        Row: {
          created_at: string
          id: string
          question_id: string | null
          response: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id?: string | null
          response: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string | null
          response?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "interview_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          industry: string
          job_description: string | null
          job_title: string
          questions: Json | null
          session_id: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          industry: string
          job_description?: string | null
          job_title: string
          questions?: Json | null
          session_id?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          industry?: string
          job_description?: string | null
          job_title?: string
          questions?: Json | null
          session_id?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      learning_goals: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          progress: number | null
          status: string
          student_id: string
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          progress?: number | null
          status?: string
          student_id: string
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          progress?: number | null
          status?: string
          student_id?: string
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_library: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          file_size: number
          file_type: string
          id: string
          metadata: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          file_size: number
          file_type: string
          id?: string
          metadata?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          metadata?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_library_teacher_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_audit: {
        Row: {
          error_message: string | null
          executed_at: string | null
          executed_by: string | null
          execution_time_ms: number | null
          id: string
          migration_name: string
          operation_type: string
          records_affected: number | null
          table_name: string | null
          validation_errors: Json | null
        }
        Insert: {
          error_message?: string | null
          executed_at?: string | null
          executed_by?: string | null
          execution_time_ms?: number | null
          id?: string
          migration_name: string
          operation_type: string
          records_affected?: number | null
          table_name?: string | null
          validation_errors?: Json | null
        }
        Update: {
          error_message?: string | null
          executed_at?: string | null
          executed_by?: string | null
          execution_time_ms?: number | null
          id?: string
          migration_name?: string
          operation_type?: string
          records_affected?: number | null
          table_name?: string | null
          validation_errors?: Json | null
        }
        Relationships: []
      }
      migration_rollback_data: {
        Row: {
          created_at: string | null
          id: string
          migration_name: string
          operation_type: string
          rollback_data: Json
          table_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          migration_name: string
          operation_type: string
          rollback_data: Json
          table_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          migration_name?: string
          operation_type?: string
          rollback_data?: Json
          table_name?: string
        }
        Relationships: []
      }
      openai_file_references: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          openai_file_id: string | null
          original_file_path: string
          status: Database["public"]["Enums"]["processing_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          openai_file_id?: string | null
          original_file_path: string
          status?: Database["public"]["Enums"]["processing_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          openai_file_id?: string | null
          original_file_path?: string
          status?: Database["public"]["Enums"]["processing_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      private_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "private_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_textbook_content: {
        Row: {
          content: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          embedding: string | null
          id: string
          metadata: Json | null
          original_file_path: string
          parent_id: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          original_file_path: string
          parent_id?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          original_file_path?: string
          parent_id?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "processed_textbook_content_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "processed_textbook_content"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_jobs: {
        Row: {
          content_id: string | null
          created_at: string | null
          current_batch: number | null
          error_message: string | null
          id: string
          metadata: Json | null
          processed_chunks: number | null
          status: string | null
          total_chunks: number
          updated_at: string | null
        }
        Insert: {
          content_id?: string | null
          created_at?: string | null
          current_batch?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          processed_chunks?: number | null
          status?: string | null
          total_chunks: number
          updated_at?: string | null
        }
        Update: {
          content_id?: string | null
          created_at?: string | null
          current_batch?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          processed_chunks?: number | null
          status?: string | null
          total_chunks?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processing_jobs_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "processed_textbook_content"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          completed_internships: number | null
          course_guide_completed: boolean
          created_at: string
          email: string
          feedback_consent: boolean | null
          feedback_consent_date: string | null
          feedback_email_sent: boolean | null
          feedback_email_sent_at: string | null
          first_name: string
          id: string
          last_name: string
          onboarding_complete: boolean
          promo_code_used: string | null
          promotional_internships_remaining: number | null
          school: string
          subscription_tier: string
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
          welcome_email_sent: boolean
        }
        Insert: {
          avatar_url?: string | null
          completed_internships?: number | null
          course_guide_completed?: boolean
          created_at?: string
          email: string
          feedback_consent?: boolean | null
          feedback_consent_date?: string | null
          feedback_email_sent?: boolean | null
          feedback_email_sent_at?: string | null
          first_name: string
          id: string
          last_name: string
          onboarding_complete?: boolean
          promo_code_used?: string | null
          promotional_internships_remaining?: number | null
          school: string
          subscription_tier?: string
          updated_at?: string
          user_type: Database["public"]["Enums"]["user_type"]
          welcome_email_sent?: boolean
        }
        Update: {
          avatar_url?: string | null
          completed_internships?: number | null
          course_guide_completed?: boolean
          created_at?: string
          email?: string
          feedback_consent?: boolean | null
          feedback_consent_date?: string | null
          feedback_email_sent?: boolean | null
          feedback_email_sent_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          onboarding_complete?: boolean
          promo_code_used?: string | null
          promotional_internships_remaining?: number | null
          school?: string
          subscription_tier?: string
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          welcome_email_sent?: boolean
        }
        Relationships: []
      }
      promotional_code_redemptions: {
        Row: {
          code_id: string
          id: string
          ip_address: string | null
          redeemed_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          code_id: string
          id?: string
          ip_address?: string | null
          redeemed_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          code_id?: string
          id?: string
          ip_address?: string | null
          redeemed_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotional_code_redemptions_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "promotional_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotional_code_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promotional_codes: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          internships_granted: number | null
          max_uses: number
          metadata: Json | null
          starts_at: string
          type: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          internships_granted?: number | null
          max_uses: number
          metadata?: Json | null
          starts_at: string
          type: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          internships_granted?: number | null
          max_uses?: number
          metadata?: Json | null
          starts_at?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      promotional_feedback_reminders: {
        Row: {
          created_at: string | null
          feedback_submitted: boolean | null
          feedback_submitted_at: string | null
          id: string
          internship_session_id: string
          scheduled_for: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback_submitted?: boolean | null
          feedback_submitted_at?: string | null
          id?: string
          internship_session_id: string
          scheduled_for: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback_submitted?: boolean | null
          feedback_submitted_at?: string | null
          id?: string
          internship_session_id?: string
          scheduled_for?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotional_feedback_reminders_internship_session_id_fkey"
            columns: ["internship_session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotional_feedback_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      question_responses: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean | null
          question_id: string
          quiz_response_id: string
          student_answer: string | null
          topic: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          quiz_response_id: string
          student_answer?: string | null
          topic?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          quiz_response_id?: string
          student_answer?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_responses_quiz_response_id_fkey"
            columns: ["quiz_response_id"]
            isOneToOne: false
            referencedRelation: "quiz_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      question_templates: {
        Row: {
          created_at: string | null
          difficulty: string
          id: string
          industry: string
          keywords: string[]
          question_type: string
          role_category: string
          template: string
          variables: Json
        }
        Insert: {
          created_at?: string | null
          difficulty: string
          id?: string
          industry: string
          keywords?: string[]
          question_type: string
          role_category: string
          template: string
          variables: Json
        }
        Update: {
          created_at?: string | null
          difficulty?: string
          id?: string
          industry?: string
          keywords?: string[]
          question_type?: string
          role_category?: string
          template?: string
          variables?: Json
        }
        Relationships: []
      }
      quiz_progress: {
        Row: {
          created_at: string
          current_question_index: number
          id: string
          quiz_id: string
          selected_answers: Json
          student_id: string
          time_remaining: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_question_index?: number
          id?: string
          quiz_id: string
          selected_answers?: Json
          student_id: string
          time_remaining?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_question_index?: number
          id?: string
          quiz_id?: string
          selected_answers?: Json
          student_id?: string
          time_remaining?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_progress_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          difficulty: Database["public"]["Enums"]["question_difficulty"]
          explanation: string | null
          id: string
          options: Json
          points: number | null
          question: string
          question_type: string | null
          quiz_id: string
          topic: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          difficulty?: Database["public"]["Enums"]["question_difficulty"]
          explanation?: string | null
          id?: string
          options?: Json
          points?: number | null
          question: string
          question_type?: string | null
          quiz_id: string
          topic: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          difficulty?: Database["public"]["Enums"]["question_difficulty"]
          explanation?: string | null
          id?: string
          options?: Json
          points?: number | null
          question?: string
          question_type?: string | null
          quiz_id?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_responses: {
        Row: {
          ai_feedback: Json | null
          attempt_number: number | null
          completed_at: string | null
          correct_answers: number | null
          created_at: string
          id: string
          quiz_id: string
          score: number | null
          start_time: string | null
          student_id: string
          topic_performance: Json | null
          total_questions: number | null
        }
        Insert: {
          ai_feedback?: Json | null
          attempt_number?: number | null
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string
          id?: string
          quiz_id: string
          score?: number | null
          start_time?: string | null
          student_id: string
          topic_performance?: Json | null
          total_questions?: number | null
        }
        Update: {
          ai_feedback?: Json | null
          attempt_number?: number | null
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string
          id?: string
          quiz_id?: string
          score?: number | null
          start_time?: string | null
          student_id?: string
          topic_performance?: Json | null
          total_questions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_responses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          allow_retakes: boolean | null
          course_id: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          published: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_retakes?: boolean | null
          course_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          published?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_retakes?: boolean | null
          course_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          published?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_teacher_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_reminders: {
        Row: {
          created_at: string
          email: string
          id: string
          reminder_time: string
          session_id: string
          session_start_time: string
          session_title: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          reminder_time: string
          session_id: string
          session_start_time: string
          session_title: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          reminder_time?: string
          session_id?: string
          session_start_time?: string
          session_title?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_reminders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_resources: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          file_path: string | null
          id: string
          resource_type: string
          shared_by: string
          study_group_id: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          resource_type: string
          shared_by: string
          study_group_id?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          resource_type?: string
          shared_by?: string
          study_group_id?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_resources_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_resources_study_group_id_fkey"
            columns: ["study_group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_assessment_results: {
        Row: {
          ai_feedback: Json | null
          answers: Json | null
          assessment_id: string
          completed_at: string | null
          created_at: string
          detailed_results: Json | null
          id: string
          improvement_suggestions: Json | null
          level: string | null
          response_analysis: Json | null
          score: number
          skill_scores: Json | null
          strengths_identified: Json | null
          tier: string | null
          time_spent: number | null
          user_id: string
        }
        Insert: {
          ai_feedback?: Json | null
          answers?: Json | null
          assessment_id: string
          completed_at?: string | null
          created_at?: string
          detailed_results?: Json | null
          id?: string
          improvement_suggestions?: Json | null
          level?: string | null
          response_analysis?: Json | null
          score: number
          skill_scores?: Json | null
          strengths_identified?: Json | null
          tier?: string | null
          time_spent?: number | null
          user_id: string
        }
        Update: {
          ai_feedback?: Json | null
          answers?: Json | null
          assessment_id?: string
          completed_at?: string | null
          created_at?: string
          detailed_results?: Json | null
          id?: string
          improvement_suggestions?: Json | null
          level?: string | null
          response_analysis?: Json | null
          score?: number
          skill_scores?: Json | null
          strengths_identified?: Json | null
          tier?: string | null
          time_spent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "skill_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_assessments: {
        Row: {
          assessment_type: string | null
          created_at: string
          creator_id: string
          description: string | null
          id: string
          industry: string
          level: string | null
          questions: Json
          role: string
          skills_tested: Json | null
          tier: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assessment_type?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          industry: string
          level?: string | null
          questions?: Json
          role: string
          skills_tested?: Json | null
          tier?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assessment_type?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          industry?: string
          level?: string | null
          questions?: Json
          role?: string
          skills_tested?: Json | null
          tier?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          max_level: number | null
          name: string
          updated_at: string | null
          xp_per_level: number | null
        }
        Insert: {
          category: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          max_level?: number | null
          name: string
          updated_at?: string | null
          xp_per_level?: number | null
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          max_level?: number | null
          name?: string
          updated_at?: string | null
          xp_per_level?: number | null
        }
        Relationships: []
      }
      student_courses: {
        Row: {
          course_id: string
          enrolled_at: string
          id: string
          last_accessed: string
          status: string
          student_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          id?: string
          last_accessed?: string
          status?: string
          student_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          id?: string
          last_accessed?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      student_performance: {
        Row: {
          areas_for_improvement: string[] | null
          average_score: number
          completed_quizzes: number
          course_id: string
          id: string
          last_activity: string
          strengths: string[] | null
          student_id: string
          total_quizzes: number
        }
        Insert: {
          areas_for_improvement?: string[] | null
          average_score?: number
          completed_quizzes?: number
          course_id: string
          id?: string
          last_activity?: string
          strengths?: string[] | null
          student_id: string
          total_quizzes?: number
        }
        Update: {
          areas_for_improvement?: string[] | null
          average_score?: number
          completed_quizzes?: number
          course_id?: string
          id?: string
          last_activity?: string
          strengths?: string[] | null
          student_id?: string
          total_quizzes?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_performance_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_performance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_quiz_scores: {
        Row: {
          course_id: string
          id: string
          max_score: number
          quiz_id: string
          score: number
          student_id: string
          taken_at: string | null
        }
        Insert: {
          course_id: string
          id?: string
          max_score: number
          quiz_id: string
          score: number
          student_id: string
          taken_at?: string | null
        }
        Update: {
          course_id?: string
          id?: string
          max_score?: number
          quiz_id?: string
          score?: number
          student_id?: string
          taken_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_quiz_scores_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_quiz_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_members: {
        Row: {
          group_id: string
          joined_at: string
          member_id: string
          role: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          member_id: string
          role?: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          member_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_group_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          course_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          max_members: number | null
          name: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          max_members?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          max_members?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          end_time: string
          id: string
          notify_user: boolean | null
          start_time: string
          status: string
          student_id: string
          title: string
          topics: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          notify_user?: boolean | null
          start_time: string
          status?: string
          student_id: string
          title: string
          topics?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          notify_user?: boolean | null
          start_time?: string
          status?: string
          student_id?: string
          title?: string
          topics?: string | null
        }
        Relationships: []
      }
      subscription_feature_usage: {
        Row: {
          created_at: string | null
          feature_name: string
          id: string
          last_used: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feature_name: string
          id?: string
          last_used?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feature_name?: string
          id?: string
          last_used?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_id: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_skill_mapping: {
        Row: {
          created_at: string | null
          id: string
          proficiency_weight: number | null
          skill_id: string
          task_id: string
          xp_reward: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          proficiency_weight?: number | null
          skill_id: string
          task_id: string
          xp_reward?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          proficiency_weight?: number | null
          skill_id?: string
          task_id?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "task_skill_mapping_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_skill_mapping_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "internship_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      temp_files: {
        Row: {
          created_at: string
          expires_at: string
          file_path: string
          id: string
          processed: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          file_path: string
          id?: string
          processed?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          file_path?: string
          id?: string
          processed?: boolean
          user_id?: string
        }
        Relationships: []
      }
      textbook_embeddings: {
        Row: {
          content_id: string
          created_at: string
          embedding: string | null
          id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          embedding?: string | null
          id?: string
        }
        Update: {
          content_id?: string
          created_at?: string
          embedding?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "textbook_embeddings_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "processed_textbook_content"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_conversations: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          learning_path: Json | null
          progress: number | null
          smart_notes: Json | null
          student_id: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          learning_path?: Json | null
          progress?: number | null
          smart_notes?: Json | null
          student_id: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          learning_path?: Json | null
          progress?: number | null
          smart_notes?: Json | null
          student_id?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_conversations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "tutor_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_key: string
          achievement_type: string
          id: string
          metadata: Json | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_key: string
          achievement_type: string
          id?: string
          metadata?: Json | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_key?: string
          achievement_type?: string
          id?: string
          metadata?: Json | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_streaks: {
        Row: {
          created_at: string | null
          current_streak: number
          id: string
          last_active_date: string | null
          longest_streak: number
          streak_start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          streak_start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          streak_start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          assessment_credits: number
          created_at: string
          id: string
          interview_credits: number
          quiz_credits: number
          tutor_message_credits: number
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_credits?: number
          created_at?: string
          id?: string
          interview_credits?: number
          quiz_credits?: number
          tutor_message_credits?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_credits?: number
          created_at?: string
          id?: string
          interview_credits?: number
          quiz_credits?: number
          tutor_message_credits?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_feature_interactions: {
        Row: {
          action: string
          feature: string
          id: string
          metadata: Json | null
          timestamp: string
          user_id: string
        }
        Insert: {
          action: string
          feature: string
          id?: string
          metadata?: Json | null
          timestamp?: string
          user_id: string
        }
        Update: {
          action?: string
          feature?: string
          id?: string
          metadata?: Json | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      user_news_preferences: {
        Row: {
          created_at: string
          id: string
          industry_specific: string | null
          topics: Database["public"]["Enums"]["news_topic"][] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          industry_specific?: string | null
          topics?: Database["public"]["Enums"]["news_topic"][] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          industry_specific?: string | null
          topics?: Database["public"]["Enums"]["news_topic"][] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_skill_progress: {
        Row: {
          best_submission_id: string | null
          created_at: string | null
          current_level: number | null
          current_xp: number | null
          evidence_submissions: string[] | null
          id: string
          last_activity: string | null
          skill_id: string
          total_submissions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          best_submission_id?: string | null
          created_at?: string | null
          current_level?: number | null
          current_xp?: number | null
          evidence_submissions?: string[] | null
          id?: string
          last_activity?: string | null
          skill_id: string
          total_submissions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          best_submission_id?: string | null
          created_at?: string | null
          current_level?: number | null
          current_xp?: number | null
          evidence_submissions?: string[] | null
          id?: string
          last_activity?: string | null
          skill_id?: string
          total_submissions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skill_progress_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      virtual_internship_logins: {
        Row: {
          created_at: string | null
          id: string
          login_date: string
          login_timestamp: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          login_date: string
          login_timestamp?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          login_date?: string
          login_timestamp?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "virtual_internship_logins_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      virtual_internship_waitlist: {
        Row: {
          created_at: string
          email: string
          email_consent: boolean
          id: string
          name: string
          signed_up_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          email_consent?: boolean
          id?: string
          name: string
          signed_up_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          email_consent?: boolean
          id?: string
          name?: string
          signed_up_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      welcome_section_config: {
        Row: {
          created_at: string
          id: string
          show_chat_input: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          show_chat_input?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          show_chat_input?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      internship_inbox_messages: {
        Row: {
          context_data: Json | null
          created_at: string | null
          direction: string | null
          id: string | null
          is_read: boolean | null
          message_content: string | null
          message_type: string | null
          meta: Json | null
          sender_persona: Json | null
          sender_type: string | null
          sent_at: string | null
          session_id: string | null
          subject: string | null
          thread_id: string | null
          user_id: string | null
        }
        Insert: {
          context_data?: Json | null
          created_at?: string | null
          direction?: string | null
          id?: string | null
          is_read?: boolean | null
          message_content?: string | null
          message_type?: string | null
          meta?: Json | null
          sender_persona?: Json | null
          sender_type?: string | null
          sent_at?: string | null
          session_id?: string | null
          subject?: string | null
          thread_id?: string | null
          user_id?: string | null
        }
        Update: {
          context_data?: Json | null
          created_at?: string | null
          direction?: string | null
          id?: string | null
          is_read?: boolean | null
          message_content?: string | null
          message_type?: string | null
          meta?: Json | null
          sender_persona?: Json | null
          sender_type?: string | null
          sent_at?: string | null
          session_id?: string | null
          subject?: string | null
          thread_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_supervisor_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_health_dashboard: {
        Row: {
          avg_execution_time_ms: number | null
          error_count: number | null
          last_execution: string | null
          migration_name: string | null
          operation_count: number | null
          operation_type: string | null
          table_name: string | null
          total_records_affected: number | null
        }
        Relationships: []
      }
      response_processing_dashboard: {
        Row: {
          auto_response_generated: boolean | null
          content: string | null
          escalation_reason: string | null
          id: string | null
          original_sender: string | null
          original_sent_at: string | null
          original_subject: string | null
          pending_minutes: number | null
          processed: boolean | null
          processing_status: string | null
          received_at: string | null
          reply_to_name: string | null
          reply_to_type: string | null
          response_time_hours: number | null
          session_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievement_details: {
        Row: {
          achievement_key: string | null
          achievement_type: string | null
          description: string | null
          icon: string | null
          id: string | null
          metadata: Json | null
          title: string | null
          unlocked_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_level_from_xp: {
        Args: { xp: number; xp_per_level?: number }
        Returns: number
      }
      check_messaging_system_health: {
        Args: never
        Returns: {
          component: string
          details: Json
          status: string
        }[]
      }
      cleanup_old_responses: { Args: never; Returns: undefined }
      get_app_config: { Args: { config_key: string }; Returns: string }
      get_response_processing_metrics: {
        Args: never
        Returns: {
          avg_processing_time_minutes: number
          escalation_rate: number
          total_escalated: number
          total_failed: number
          total_pending: number
          total_processed: number
        }[]
      }
      get_session_response_stats: {
        Args: { p_session_id: string }
        Returns: {
          avg_response_time_hours: number
          pending_responses: number
          response_rate: number
          session_id: string
          total_messages: number
          total_responses: number
        }[]
      }
      get_supervisor_median_reply_time: {
        Args: { p_days?: number; p_session: string; p_user: string }
        Returns: number
      }
      get_supervisor_metrics_summary: {
        Args: { p_days?: number; p_session: string; p_user: string }
        Returns: {
          median_reply_hours: number
          open_rate: number
          sent_count: number
          total_replies: number
          unread_count: number
        }[]
      }
      get_supervisor_open_rate: {
        Args: { p_days?: number; p_session: string; p_user: string }
        Returns: number
      }
      get_supervisor_sent_count: {
        Args: { p_days?: number; p_session: string; p_user: string }
        Returns: number
      }
      get_unread_message_count: {
        Args: { p_session: string; p_user: string }
        Returns: number
      }
      handle_phase_progression: {
        Args: {
          p_current_phase: number
          p_next_phase: number
          p_session_id: string
          p_user_id: string
        }
        Returns: Json
      }
      handle_user_subscription: {
        Args: {
          p_cancel_at_period_end: boolean
          p_current_period_end: string
          p_plan_id: string
          p_status: string
          p_stripe_customer_id: string
          p_stripe_subscription_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      increment_interactions: {
        Args: { p_inc: number; p_session: string; p_user: string }
        Returns: undefined
      }
      mark_messages_read: { Args: { p_message_ids: string[] }; Returns: number }
      match_content_chunks: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          chunk_index: number
          chunk_text: string
          content_id: string
          id: string
          similarity: number
        }[]
      }
      migrate_supervisor_messages_to_v2: { Args: never; Returns: number }
      migrate_supervisor_messages_to_v2_permissive: {
        Args: never
        Returns: {
          execution_time_ms: number
          operation_result: string
          records_processed: number
          validation_warnings: Json
        }[]
      }
      migrate_supervisor_messages_to_v2_safe: {
        Args: never
        Returns: {
          execution_time_ms: number
          operation_result: string
          records_processed: number
          validation_errors: Json
        }[]
      }
      recalculate_virtual_internship_streak: {
        Args: { p_user_id: string }
        Returns: {
          current_streak: number
          last_active_date: string
          longest_streak: number
        }[]
      }
      redeem_promo_code: {
        Args: {
          p_code: string
          p_ip_address?: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: Record<string, unknown>
      }
      rollback_messaging_migration: {
        Args: never
        Returns: {
          error_message: string
          operation_result: string
          records_affected: number
        }[]
      }
      schedule_feedback_reminder: {
        Args: { p_days_delay?: number; p_session_id: string; p_user_id: string }
        Returns: undefined
      }
      update_user_skill_progress: {
        Args: {
          p_skill_id: string
          p_submission_id?: string
          p_user_id: string
          p_xp_gained: number
        }
        Returns: undefined
      }
      update_virtual_internship_streak:
        | {
            Args: { p_session_id?: string; p_user_id: string }
            Returns: {
              current_streak: number
              last_active_date: string
              longest_streak: number
            }[]
          }
        | {
            Args: {
              p_session_id?: string
              p_user_date?: string
              p_user_id: string
            }
            Returns: {
              current_streak: number
              last_active_date: string
              longest_streak: number
            }[]
          }
      validate_course_material_content: {
        Args: { content_to_validate: string }
        Returns: boolean
      }
      validate_messaging_data_post_migration: {
        Args: never
        Returns: {
          details: Json
          issue_count: number
          table_name: string
          validation_type: string
        }[]
      }
      validate_messaging_data_pre_migration: {
        Args: never
        Returns: {
          details: Json
          issue_count: number
          table_name: string
          validation_type: string
        }[]
      }
      validate_promo_code: {
        Args: { p_code: string }
        Returns: Record<string, unknown>
      }
    }
    Enums: {
      content_type: "chapter" | "section" | "definition" | "formula" | "example"
      news_topic:
        | "business_economics"
        | "political_science_law"
        | "science_technology"
        | "healthcare_medicine"
        | "engineering_applied_sciences"
        | "arts_humanities_social_sciences"
        | "education"
        | "mathematics_statistics"
        | "industry_specific"
        | "cybersecurity_it"
      processing_status: "pending" | "processing" | "completed" | "failed"
      question_difficulty: "beginner" | "intermediate" | "advanced" | "expert"
      user_type: "teacher" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      content_type: ["chapter", "section", "definition", "formula", "example"],
      news_topic: [
        "business_economics",
        "political_science_law",
        "science_technology",
        "healthcare_medicine",
        "engineering_applied_sciences",
        "arts_humanities_social_sciences",
        "education",
        "mathematics_statistics",
        "industry_specific",
        "cybersecurity_it",
      ],
      processing_status: ["pending", "processing", "completed", "failed"],
      question_difficulty: ["beginner", "intermediate", "advanced", "expert"],
      user_type: ["teacher", "student"],
    },
  },
} as const
