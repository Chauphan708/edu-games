import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Play, SkipForward, Square } from 'lucide-react'
import { useRoom } from '../../hooks/useRoom'
import { useGameSync } from '../../hooks/useGameSync'
import Leaderboard from '../../components/ui/Leaderboard'
import { GAME_COMPONENTS } from '../../games/registry'
import { useGameStore } from '../../store/gameStore'
import type { GameType } from '../../types/supabase'

export default function LiveSession() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const { room, updateRoomStatus, nextQuestion } = useRoom()
  const { participants } = useGameStore()
  
  useGameSync({ roomId: room?.id || '' })

  if (!room) {
    return (
      <div className="flex-center p-2xl">
        <div className="loader"></div>
        <p className="ms-md">Đang tải phòng...</p>
      </div>
    )
  }

  const GameComponent = GAME_COMPONENTS[room.games?.game_type as GameType]

  return (
    <div className="live-session-page container">
      <div className="live-header card flex flex-between items-center">
        <div className="flex items-center gap-md">
          <div className="room-badge">Mã phòng: <strong>{roomCode}</strong></div>
          <div className="participants-count">
            <Users size={20} />
            <span>{participants.length}</span>
          </div>
        </div>

        <div className="flex gap-md">
          {room.status === 'waiting' && (
            <button className="btn btn-success" onClick={() => updateRoomStatus('playing')}>
              <Play size={18} /> Bắt đầu ngay
            </button>
          )}
          {room.status === 'playing' && (
            <>
              <button className="btn btn-secondary" onClick={nextQuestion}>
                <SkipForward size={18} /> Câu tiếp theo
              </button>
              <button className="btn btn-danger" onClick={() => updateRoomStatus('ended')}>
                <Square size={18} /> Kết thúc
              </button>
            </>
          )}
        </div>
      </div>

      <div className="live-main-grid">
        <div className="game-preview-container card">
          <AnimatePresence mode="wait">
            {GameComponent ? (
              <motion.div
                key={room.current_question}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="full-height"
              >
                <GameComponent 
                   role="teacher" 
                   question={room.games?.questions?.[room.current_question]} 
                />
              </motion.div>
            ) : (
              <div className="flex-center full-height">Không tìm thấy giao diện game</div>
            )}
          </AnimatePresence>
        </div>

        <div className="live-sidebar">
          <Leaderboard 
            entries={participants.map(p => ({
              id: p.id,
              name: p.player_name,
              score: p.score,
              streak: p.streak
            }))} 
          />
        </div>
      </div>
    </div>
  )
}
