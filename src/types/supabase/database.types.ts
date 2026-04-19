/**
 * Modèle aligné sur le schéma Supabase (voir `supabase/migrations/`).
 * Pour régénérer : `npx supabase gen types typescript --project-id <ref> > src/types/supabase/database.types.ts`
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type LevelCode = 'Z0' | 'Z1' | 'Z2' | 'Z3' | 'A1' | 'A2' | 'A3';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          bio: string | null;
          level_code: LevelCode;
          total_score: number;
          quizzes_completed: number;
          days_active: number;
          streak_days: number;
          is_premium: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          level_code?: LevelCode;
          total_score?: number;
          quizzes_completed?: number;
          days_active?: number;
          streak_days?: number;
          is_premium?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
        Relationships: [];
      };
      quizzes: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category_id: string | null;
          difficulty_level: LevelCode;
          theme: string | null;
          thumbnail_url: string | null;
          total_questions: number;
          points_per_question: number;
          completion_bonus: number;
          play_count: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category_id?: string | null;
          difficulty_level?: LevelCode;
          theme?: string | null;
          thumbnail_url?: string | null;
          total_questions?: number;
          points_per_question?: number;
          completion_bonus?: number;
          play_count?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['quizzes']['Insert']>;
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          quiz_id: string;
          question_text: string;
          options: Json;
          correct_option_id: string;
          explanation: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question_text: string;
          options: Json;
          correct_option_id: string;
          explanation?: string | null;
          order_index: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['questions']['Insert']>;
        Relationships: [];
      };
      quiz_sessions: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          score: number;
          answers: Json;
          started_at: string;
          completed_at: string | null;
          is_completed: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          score?: number;
          answers?: Json;
          started_at?: string;
          completed_at?: string | null;
          is_completed?: boolean;
        };
        Update: Partial<Database['public']['Tables']['quiz_sessions']['Insert']>;
        Relationships: [];
      };
      friendships: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['friendships']['Insert']>;
        Relationships: [];
      };
      challenges: {
        Row: {
          id: string;
          challenger_id: string;
          challenged_id: string;
          quiz_id: string;
          status: 'pending' | 'accepted' | 'declined' | 'completed';
          challenger_score: number | null;
          challenged_score: number | null;
          winner_id: string | null;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          challenger_id: string;
          challenged_id: string;
          quiz_id: string;
          status?: 'pending' | 'accepted' | 'declined' | 'completed';
          challenger_score?: number | null;
          challenged_score?: number | null;
          winner_id?: string | null;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['challenges']['Insert']>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          data: Json;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body?: string | null;
          data?: Json;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
        Relationships: [];
      };
      otp_codes: {
        Row: {
          id: string;
          identifier: string;
          user_id: string | null;
          code: string;
          type: 'password_reset' | 'phone_verify';
          is_used: boolean;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          identifier: string;
          user_id?: string | null;
          code: string;
          type?: 'password_reset' | 'phone_verify';
          is_used?: boolean;
          expires_at?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['otp_codes']['Insert']>;
        Relationships: [];
      };
    };
    Views: {
      leaderboard: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          total_score: number;
          level_code: LevelCode;
          quizzes_completed: number;
          rank: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
