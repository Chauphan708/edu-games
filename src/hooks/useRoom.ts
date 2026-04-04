import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { generateRoomCode } from '../lib/roomCode'
import type { Room, Participant } from '../types/supabase'

interface UseRoomReturn {
  room: Room | null
  participants: Participant[]
  loading: boolean
  error: string | null
  createRoom: (gameId: string, teacherId: string) => Promise<string | null>
  joinRoom: (roomCode: string, playerName: string, userId?: string) => Promise<Participant | null>
  updateRoomStatus: (status: Room['status']) => Promise<void>
  updateGameState: (gameState: Record<string, unknown>) => Promise<void>
  nextQuestion: () => Promise<void>
  fetchRoom: (roomCode: string) => Promise<Room | null>
  leaveRoom: (participantId: string) => Promise<void>
}

export function useRoom(): UseRoomReturn {
  const [room, setRoom] = useState<Room | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Create a new room (Teacher only)
   */
  const createRoom = useCallback(async (gameId: string, teacherId: string): Promise<string | null> => {
    setLoading(true)
    setError(null)

    // Try generating a unique code (max 5 attempts)
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateRoomCode()

      const { data, error: insertError } = await supabase
        .from('rooms')
        .insert({
          room_code: code,
          game_id: gameId,
          teacher_id: teacherId,
          status: 'waiting' as const,
          current_question: 0,
          game_state: {},
        } as any)
        .select()
        .single()

      if (!insertError && data) {
        setRoom(data as Room)
        setLoading(false)
        return code
      }

      // If code already exists (unique constraint), retry
      if (insertError?.code === '23505') continue

      setError(insertError?.message || 'Không thể tạo phòng')
      setLoading(false)
      return null
    }

    setError('Không thể tạo mã phòng duy nhất. Vui lòng thử lại.')
    setLoading(false)
    return null
  }, [])

  /**
   * Join an existing room (Student)
   */
  const joinRoom = useCallback(async (
    roomCode: string,
    playerName: string,
    userId?: string
  ): Promise<Participant | null> => {
    setLoading(true)
    setError(null)

    // Find room by code
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .in('status', ['waiting', 'playing'])
      .single()

    if (roomError || !roomData) {
      setError('Không tìm thấy phòng. Kiểm tra lại mã phòng.')
      setLoading(false)
      return null
    }

    setRoom(roomData as Room)

    // Add participant
    const { data: participantData, error: participantError } = await supabase
      .from('participants')
      .insert({
        room_id: roomData.id,
        user_id: userId || null,
        player_name: playerName.trim(),
      } as any)
      .select()
      .single()

    if (participantError) {
      setError('Không thể tham gia phòng.')
      setLoading(false)
      return null
    }

    setLoading(false)
    return participantData as Participant
  }, [])

  /**
   * Fetch room by code
   */
  const fetchRoom = useCallback(async (roomCode: string): Promise<Room | null> => {
    const { data, error: fetchError } = await supabase
      .from('rooms')
      .select('*, games(game_type, questions)') // Join to get game_type and questions
      .eq('room_code', roomCode.toUpperCase())
      .single()

    if (fetchError || !data) return null
    setRoom(data as any) // Ép kiểu tạm thời vì có nested object
    return data as any
  }, [])

  /**
   * Update room status (Teacher)
   */
  const updateRoomStatus = useCallback(async (status: Room['status']) => {
    if (!room) return

    const updateData: Record<string, unknown> = { status }
    if (status === 'playing') updateData.started_at = new Date().toISOString()
    if (status === 'ended') updateData.ended_at = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('rooms')
      .update(updateData as any)
      .eq('id', room.id)

    if (!updateError) {
      setRoom(prev => prev ? { ...prev, status, ...updateData } as Room : null)
    }
  }, [room])

  /**
   * Update game state
   */
  const updateGameState = useCallback(async (gameState: Record<string, unknown>) => {
    if (!room) return

    await supabase
      .from('rooms')
      .update({ game_state: gameState })
      .eq('id', room.id)

    setRoom(prev => prev ? { ...prev, game_state: gameState } : null)
  }, [room])

  /**
   * Move to next question
   */
  const nextQuestion = useCallback(async () => {
    if (!room) return

    const next = room.current_question + 1
    await supabase
      .from('rooms')
      .update({ current_question: next })
      .eq('id', room.id)

    setRoom(prev => prev ? { ...prev, current_question: next } : null)
  }, [room])

  /**
   * Leave room (remove participant)
   */
  const leaveRoom = useCallback(async (participantId: string) => {
    await supabase
      .from('participants')
      .delete()
      .eq('id', participantId)
  }, [])

  return {
    room,
    participants,
    loading,
    error,
    createRoom,
    joinRoom,
    updateRoomStatus,
    updateGameState,
    nextQuestion,
    fetchRoom,
    leaveRoom,
  }
}
