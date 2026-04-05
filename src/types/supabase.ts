/* ═══════════════════════════════════════
   Database Types (manually defined)
   Replace with auto-generated types later:
   npx supabase gen types typescript --local > src/types/supabase.ts
   ═══════════════════════════════════════ */

export interface Database {
  public: {
    Tables: {
      teacher_settings: {
        Row: TeacherSettings
        Insert: Partial<TeacherSettings> & { user_id: string }
        Update: Partial<TeacherSettings>
      }
      games: {
        Row: Game
        Insert: Omit<Game, 'id' | 'created_at' | 'updated_at' | 'play_count'>
        Update: Partial<Game>
      }
      rooms: {
        Row: Room
        Insert: Omit<Room, 'id' | 'created_at' | 'started_at' | 'ended_at'>
        Update: Partial<Room>
      }
      participants: {
        Row: Participant
        Insert: Omit<Participant, 'id' | 'joined_at' | 'score' | 'streak' | 'best_streak' | 'is_ready'>
        Update: Partial<Participant>
      }
      submissions: {
        Row: Submission
        Insert: Omit<Submission, 'id' | 'submitted_at'>
        Update: Partial<Submission>
      }
      session_results: {
        Row: SessionResult
        Insert: Omit<SessionResult, 'id' | 'completed_at'>
        Update: Partial<SessionResult>
      }
      question_bank: {
        Row: QuestionBankItem
        Insert: Partial<QuestionBankItem> & { teacher_id: string }
        Update: Partial<QuestionBankItem>
      }
    }
  }
}

export interface TeacherSettings {
  user_id: string
  gemini_api_key: string | null
  display_name: string | null
  school: string | null
  preferences: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  teacher_id: string
  title: string
  description: string | null
  game_type: GameType
  group_name: GameGroup
  questions: Question[]
  settings: GameSettings
  is_public: boolean
  play_count: number
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  room_code: string
  game_id: string | null
  teacher_id: string
  status: RoomStatus
  current_question: number
  game_state: Record<string, unknown>
  created_at: string
  started_at: string | null
  ended_at: string | null
}

export interface Participant {
  id: string
  room_id: string
  user_id: string | null
  player_name: string
  avatar_seed: string
  team_id: string | null
  score: number
  streak: number
  best_streak: number
  is_ready: boolean
  joined_at: string
}

export interface Submission {
  id: string
  room_id: string
  participant_id: string
  question_index: number
  answer: unknown
  is_correct: boolean | null
  points_earned: number
  response_time_ms: number | null
  submitted_at: string
}

export interface SessionResult {
  id: string
  room_id: string | null
  game_id: string | null
  teacher_id: string | null
  final_scores: FinalScore[]
  question_stats: QuestionStat[]
  player_count: number | null
  duration_sec: number | null
  completed_at: string
}

// ═══════════════════════════════════════
// Enums & Helper types
// ═══════════════════════════════════════

export type RoomStatus = 'waiting' | 'playing' | 'paused' | 'ended'

export type GameGroup = 'quiz' | 'vocabulary' | 'strategy' | 'creative' | 'team'

export type GameType =
  // Quiz
  | 'speed-quiz'
  | 'quiz-race'
  | 'bomb-quiz'
  | 'brick-breaker'
  | 'true-false'
  // Vocabulary
  | 'memory-match'
  | 'matching-wires'
  | 'word-scramble'
  | 'crossword'
  | 'bingo'
  | 'drag-classify'
  // Strategy
  | 'sort-order'
  | 'treasure-hunt'
  | 'snakes-ladders'
  | 'countdown-challenge'
  // Creative
  | 'wheel-spin'
  | 'mystery-box'
  | 'reveal-puzzle'
  | 'blur-image'
  // Team
  | 'relay-quiz'
  | 'jeopardy'
  | 'battle-quiz'
  | 'boat-race'

export interface Question {
  id?: string
  content: string
  type: 'multiple-choice' | 'true-false' | 'text-input' | 'ordering' | 'matching' | 'classification'
  answers: string[]
  correct_index: number | string | string[] | number[]
  explanation?: string
  imageUrl?: string
  points?: number
  timeLimit?: number
  difficulty?: number
  subject?: string
  topic?: string
}

export interface GameSettings {
  timePerQuestion?: number
  maxScore?: number
  showExplanation?: boolean
  shuffleQuestions?: boolean
  shuffleOptions?: boolean
  backgroundTheme?: string
  musicEnabled?: boolean
  soundEffects?: boolean
}

export interface FinalScore {
  participant_id: string
  player_name: string
  score: number
  rank: number
  accuracy_pct: number
  avg_time_ms: number
}

export interface QuestionStat {
  questionIndex: number
  correct_count: number
  wrong_count: number
  avg_time_ms: number
}

export interface QuestionBankItem {
  id: string
  teacher_id: string
  content: string
  type: string
  image_url?: string
  answers?: string[] // Một số bản lưu là answers hoặc options
  options?: string[]
  correct_index?: number
  correct_option_index?: number
  is_arena_eligible?: boolean
  difficulty?: number
  subject?: string
  topic?: string
  created_at?: string
}

// ═══════════════════════════════════════
// Game Registry Info
// ═══════════════════════════════════════

export interface GameInfo {
  type: GameType
  name: string
  icon: string
  group: GameGroup
  description: string
  realtimeFeature: string
  color: string
}
