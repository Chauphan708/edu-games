import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Clock, Gamepad2 } from 'lucide-react'
import { useGameSync, useRealtimeSubscription } from '../../hooks/useGameSync'
import { useRoom } from '../../hooks/useRoom'
import { useGameStore } from '../../store/gameStore'
import type { Participant, Room } from '../../types/supabase'

export default function Lobby() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const { fetchRoom } = useRoom()
  const { currentParticipant, participants, setParticipants, addParticipant, setCurrentRoom } = useGameStore()
  const [room, setRoom] = useState<Room | null>(null)

  // Fetch room info
  useEffect(() => {
    if (!roomCode) return
    fetchRoom(roomCode).then((r) => {
      if (r) {
        setRoom(r)
        setCurrentRoom(r)
      }
    })
  }, [roomCode])

  // Subscribe to new participants
  useRealtimeSubscription<Participant>(
    'participants',
    { column: 'room_id', value: room?.id || '' },
    (newParticipant) => addParticipant(newParticipant),
    (updatedParticipant) => addParticipant(updatedParticipant),
  )

  // Subscribe to room status changes
  useRealtimeSubscription<Room>(
    'rooms',
    { column: 'id', value: room?.id || '' },
    undefined,
    (updatedRoom) => {
      setRoom(updatedRoom)
      if (updatedRoom.status === 'playing') {
        navigate(`/play/${roomCode}`)
      }
    },
  )

  // Fetch initial participants
  useEffect(() => {
    if (!room?.id) return
    import('../../lib/supabase').then(({ supabase }) => {
      supabase
        .from('participants')
        .select('*')
        .eq('room_id', room.id)
        .then(({ data }) => {
          if (data) setParticipants(data as Participant[])
        })
    })
  }, [room?.id])

  if (!room) {
    return (
      <div className="lobby-page flex flex-center" style={{ minHeight: '100vh' }}>
        <div className="animate-spin" style={{ fontSize: '2rem' }}>⏳</div>
      </div>
    )
  }

  return (
    <div className="lobby-page">
      <div className="container container-sm" style={{ paddingTop: 'var(--space-2xl)' }}>
        {/* Room Code Display */}
        <motion.div
          className="lobby-room-code"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
            Mã phòng
          </p>
          <div className="room-code">
            {roomCode?.split('').map((char, i) => (
              <span key={i} className="room-code__char">{char}</span>
            ))}
          </div>
        </motion.div>

        {/* Status */}
        <motion.div
          className="lobby-status"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="lobby-status__indicator animate-pulse">
            <Clock size={16} />
            Đang chờ giáo viên bắt đầu...
          </div>
        </motion.div>

        {/* Player count */}
        <div className="lobby-player-count">
          <Users size={20} />
          <span>{participants.length} người chơi</span>
        </div>

        {/* Player list */}
        <motion.div className="lobby-players stagger-children">
          <AnimatePresence>
            {participants.map((p, index) => (
              <motion.div
                key={p.id}
                className={`lobby-player-card ${p.id === currentParticipant?.id ? 'lobby-player-card--me' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="lobby-player-avatar">
                  {p.player_name.charAt(0).toUpperCase()}
                </div>
                <span className="lobby-player-name">
                  {p.player_name}
                  {p.id === currentParticipant?.id && (
                    <span className="badge" style={{ marginLeft: 8, background: 'var(--color-primary-glow)', color: 'var(--color-primary-light)', fontSize: '10px' }}>
                      Bạn
                    </span>
                  )}
                </span>
                {p.is_ready && (
                  <span style={{ color: 'var(--color-success)' }}>✓ Sẵn sàng</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Waiting animation */}
        <div className="lobby-waiting">
          <div className="animate-bounce" style={{ fontSize: '3rem' }}>
            <Gamepad2 size={48} style={{ color: 'var(--color-primary)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
