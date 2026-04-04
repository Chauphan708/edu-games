import { useEffect, useState, Suspense, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRoom } from '../../hooks/useRoom'
import { useGameStore } from '../../store/gameStore'
import { GAME_COMPONENTS } from '../../games/registry'
import type { GameType } from '../../types/supabase'

export default function GameWrapper() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const { room, fetchRoom } = useRoom()
  const { currentParticipant } = useGameStore()
  
  // Local state flow
  const [answered, setAnswered] = useState(false)
  
  useEffect(() => {
    if (roomCode) fetchRoom(roomCode)
  }, [roomCode])

  useEffect(() => {
      if(!roomCode) return
      const interval = setInterval(() => {
          fetchRoom(roomCode).then(latestRoom => {
             if (latestRoom && room && latestRoom.current_question !== room.current_question) {
                 setAnswered(false)
             }
             if (latestRoom?.status === 'ended') {
                 navigate(`/lobby/${roomCode}`)
             }
          })
      }, 2000)
      return () => clearInterval(interval)
  }, [roomCode, room?.current_question])

  const handleAnswer = useCallback((answer: any) => {
      if (answered) return
      setAnswered(true)
      console.log('Hệ thống Core nhận đáp án:', answer)
      // Tại đây sẽ gọi API submissions của Supabase
  }, [answered])

  if (!room || !currentParticipant) {
      return <div className="page flex flex-center">Đang tải Data...</div>
  }

  // --- LOGIC TRÍCH XUẤT DỮ LIỆU CHUẨN ---
  const roomData = room as any
  const gameType = roomData.games?.game_type as GameType | undefined
  const questions = roomData.games?.questions as any[] || []
  const currentQuestion = questions[room.current_question]
  
  const GameComponent = gameType ? GAME_COMPONENTS[gameType] : null

  return (
    <div className="page" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-base)' }}>
       {/* Top UI: Hệ thống quản lý */}
       <div className="flex flex-between" style={{ padding: 'var(--space-md) var(--space-xl)', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-md">
             <div className="badge badge-quiz">Câu {room.current_question + 1} / {questions.length}</div>
             <div className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>Phòng: {room.room_code}</div>
          </div>
          <div className="badge" style={{ background: 'var(--bg-card)', color: 'var(--color-primary-light)', fontWeight: 'bold' }}>
             Điểm: {currentParticipant.score}
          </div>
       </div>

       {/* Main Game Area: Nơi chứa 23 loại Games khác nhau */}
       <div style={{ flex: 1, padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Suspense fallback={<div className="animate-pulse">Đang nạp trò chơi...</div>}>
            {GameComponent ? (
              <GameComponent 
                role="student" 
                question={currentQuestion} 
                onAnswer={handleAnswer}
                disabled={answered}
              />
            ) : (
              <div className="card text-center">Hệ thống chưa hỗ trợ chế độ này</div>
            )}
          </Suspense>
       </div>

       {/* Bottom Overlay khi đã trả lời xong */}
       {answered && (
         <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-surface)', padding: '12px 24px', borderRadius: '40px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--color-primary)' }}>
            Chờ các bạn khác và lệnh từ Giáo viên...
         </div>
       )}
    </div>
  )
}
