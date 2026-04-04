import type { Room, Participant } from './supabase'

export interface Question {
  id: string | number
  text: string
  options?: string[]
  correctAnswer?: string | number
  imageUrl?: string
  timeLimit?: number // giây
  points?: number
  metadata?: Record<string, any>
}

export interface BaseGameProps {
  role: 'teacher' | 'student'
  // Dữ liệu từ hệ thống Core truyền xuống
  question?: Question
  gameState?: Record<string, any>
  room?: Room
  participants?: Participant[]
  currentParticipant?: Participant
  
  // Các hành động (Callbacks)
  onAnswer?: (answer: any, isCorrect?: boolean, points?: number) => void
  onAction?: (actionType: string, payload: any) => void // Chữa các hành động gameplay đặc thù
  
  // Trạng thái UI dùng chung
  isTimeUp?: boolean
  disabled?: boolean
}
