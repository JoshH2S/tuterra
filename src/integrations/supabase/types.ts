export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      internship_deliverables: {
        Row: {
          content: string
          id: string
          submitted_at: string
          task_id: string
          user_id: string
        }
        Insert: {
          content: string
          id?: string
          submitted_at?: string
          task_id: string
          user_id: string
        }
        Update: {
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
      internship_feedback: {
        Row: {
          created_at: string
          deliverable_id: string
          feedback: string
          id: string
          improvements: string[] | null
          strengths: string[] | null
        }
        Insert: {
          created_at?: string
          deliverable_id: string
          feedback: string
          id?: string
          improvements?: string[] | null
          strengths?: string[] | null
        }
        Update: {
          created_at?: string
          deliverable_id?: string
          feedback?: string
          id?: string
          improvements?: string[] | null
          strengths?: string[] | null
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
      internship_sessions: {
        Row: {
          created_at: string
          current_phase: number
          id: string
          industry: string
          job_description: string | null
          job_title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_phase?: number
          id?: string
          industry: string
          job_description?: string | null
          job_title: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_phase?: number
          id?: string
          industry?: string
          job_description?: string | null
          job_title?: string
          user_id?: string
        }
        Relationships: []
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
          course_guide_completed: boolean
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          onboarding_complete: boolean
          school: string
          subscription_tier: string
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
          welcome_email_sent: boolean
        }
        Insert: {
          avatar_url?: string | null
          course_guide_completed?: boolean
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          onboarding_complete?: boolean
          school: string
          subscription_tier?: string
          updated_at?: string
          user_type: Database["public"]["Enums"]["user_type"]
          welcome_email_sent?: boolean
        }
        Update: {
          avatar_url?: string | null
          course_guide_completed?: boolean
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          onboarding_complete?: boolean
          school?: string
          subscription_tier?: string
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          welcome_email_sent?: boolean
        }
        Relationships: []
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
          answers: Json | null
          assessment_id: string
          completed_at: string | null
          created_at: string
          detailed_results: Json | null
          id: string
          level: string | null
          score: number
          skill_scores: Json | null
          tier: string | null
          time_spent: number | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          assessment_id: string
          completed_at?: string | null
          created_at?: string
          detailed_results?: Json | null
          id?: string
          level?: string | null
          score: number
          skill_scores?: Json | null
          tier?: string | null
          time_spent?: number | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          assessment_id?: string
          completed_at?: string | null
          created_at?: string
          detailed_results?: Json | null
          id?: string
          level?: string | null
          score?: number
          skill_scores?: Json | null
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
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      handle_user_subscription: {
        Args: {
          p_user_id: string
          p_stripe_subscription_id: string
          p_stripe_customer_id: string
          p_plan_id: string
          p_status: string
          p_current_period_end: string
          p_cancel_at_period_end: boolean
        }
        Returns: undefined
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_content_chunks: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          content_id: string
          chunk_text: string
          chunk_index: number
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      validate_course_material_content: {
        Args: { content_to_validate: string }
        Returns: boolean
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
