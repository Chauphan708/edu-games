import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { generateRoomCode } from '../lib/roomCode'
import type { Room, Participant } from '../types/supabase'

interface UseRoomReturn {
  room: any | null // Để any tạm thời để tránh lỗi nested games info
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
  const [room, setRoom] = useState<any | null>(null)
  const [participants] = useState<Participant[]>([]) // TS6133 fix: Remove setParticipants
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Create a new room (Teacher only)
   */
  const createRoom = useCallback(async (gameId: string, teacherId: string): Promise<string | null> => {
    setLoading(true)
    setError(null)

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateRoomCode()
      const { data, error: insertError } = await (supabase
        .from('rooms')
        .insert({
          room_code: code,
          game_id: gameId,
          teacher_id: teacherId,
          status: 'waiting',
          current_question: 0,
          game_state: {},
        } as any)
        .select()
        .single() as any)

      if (!insertError && data) {
        setRoom(data)
        setLoading(false)
        return code
      }

      if (insertError?.code === '23505') continue

      setError(insertError?.message || 'Không thể tạo phòng')
      setLoading(false)
      return null
    }

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

    const { data: roomData, error: roomError } = await (supabase
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .in('status', ['waiting', 'playing'])
      .single() as any)

    if (roomError || !roomData) {
      setError('Không tìm thấy phòng.')
      setLoading(false)
      return null
    }

    const { data: participantData, error: participantError } = await (supabase
      .from('participants')
      .insert({
        room_id: (roomData as any).id,
        user_id: userId || null,
        player_name: playerName.trim(),
      } as any)
      .select()
      .single() as any)

    if (participantError) {
      setError('Không thể tham gia.')
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
    const { data, error: fetchError } = await (supabase
      .from('rooms')
      .select('*, games(game_type, questions)')
      .eq('room_code', roomCode.toUpperCase())
      .single() as any)

    if (fetchError || !data) return null
    setRoom(data)
    return data as Room
  }, [])

  /**
   * Update room status (Teacher)
   */
  const updateRoomStatus = useCallback(async (status: Room['status']) => {
    if (!room) return
    const updateData: any = { status }
    if (status === 'playing') updateData.started_at = new Date().toISOString()
    
    await (supabase
      .from('rooms')
      .update(updateData)
      .eq('id', room.id) as any)

    setRoom((prev: any) => prev ? { ...prev, ...updateData } : null)
  }, [room])

  /**
   * Update game state
   */
  const updateGameState = useCallback(async (gameState: Record<string, unknown>) => {
    if (!room) return
    await (supabase
      .from('rooms')
      .update({ game_state: gameState } as any)
      .eq('id', room.id) as any)

    setRoom((prev: any) => prev ? { ...prev, game_state: gameState } : null)
  }, [room])

  /**
   * Move to next question
   */
  const nextQuestion = useCallback(async () => {
    if (!room) return
    const next = room.current_question + 1
    await (supabase
      .from('rooms')
      .update({ current_question: next } as any)
      .eq('id', room.id) as any)

    setRoom((prev: any) => prev ? { ...prev, current_question: next } : null)
  }, [room])

  /**
   * Leave room
   */
  const leaveRoom = useCallback(async (participantId: string) => {
    await supabase
      .from('participants')
      .delete()
      .eq('id', participantId)
    setRoom(null)
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
    leaveRoom
  }
}
