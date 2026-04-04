import { useEffect, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Users, Play, SkipForward, Square } from 'lucide-react'
import { useRoom } from '../../hooks/useRoom'
import { useGameSync } from '../../hooks/useGameSync'
import Leaderboard from '../../components/ui/Leaderboard'
import { GAME_COMPONENTS } from '../../games/registry'
import type { Participant, GameType } from '../../types/supabase'

export default function LiveSession() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  
  const { room, participants, fetchRoom, updateRoomStatus, nextQuestion } = useRoom()
  
  // Custom hook để nhận Sync info từ học sinh (nếu cần tracking vị trí chuột, react emoj...)
  useGameSync({ roomId: room?.id || '' })

  useEffect(() => {
    if (roomCode) {
      fetchRoom(roomCode)
    }
  }, [roomCode])

  // Lấy danh sách realtime
  // Trong thực tế cần dùng useRealtimeSubscription như Lobby.tsx để update danh sách tự động.
  // Ở bản v1, dùng poll 3s hoặc ghép hook cho tiện.
  useEffect(() => {
      if(!room) return
      const interval = setInterval(() => {
          fetchRoom(roomCode!)
      }, 3000)
      return () => clearInterval(interval)
  }, [room, roomCode])


  if (!room) return <div className="page flex flex-center">Đang tải phòng {roomCode}...</div>

  // Chuyển đổi trạng thái Participant thành data cho Leaderboard
  const leaderboardData = participants.map((p: Participant) => ({
    id: p.id,
    name: p.player_name,
    score: p.score,
    streak: p.streak
  }))

  return (
    <div className="page" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
      {/* Top Banner - Projector Style */}
      <div style={{ background: 'var(--bg-card)', padding: 'var(--space-md) var(--space-2xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
         <div className="flex gap-md" style={{ alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Mã phòng tham gia:</span>
            <div className="room-code" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)' }}>
               {room.room_code.split('').map((char, i) => (
                  <span key={i} className="room-code__char" style={{ fontSize: '2rem', minWidth: '30px' }}>{char}</span>
               ))}
            </div>
         </div>
         <h1 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>
            {room.status === 'waiting' ? 'Phòng chờ' : `Câu ${room.current_question + 1}`}
         </h1>
         <div className="flex" style={{ gap: 'var(--space-md)' }}>
             <div className="badge badge-team" style={{ padding: '8px 16px', fontSize: 'var(--text-base)' }}>
                <Users size={20}/> {participants.length} Học sinh
             </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: 'var(--space-xl)', display: 'flex', gap: 'var(--space-xl)' }}>
         
         {/* Left col: Game Visuals / Question / Waiting list */}
         <div className="card" style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-surface)' }}>
            {room.status === 'waiting' ? (
              <div className="text-center animate-pulseScale">
                <h2 style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)', color: 'var(--color-primary-light)' }}>Sẵn sàng chưa?</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xl)' }}>Học sinh hãy truy cập và nhập mã phòng ở trên 👆</p>
              </div>
            ) : (
               <Suspense fallback={<div className="animate-spin text-center" style={{ fontSize: '3rem' }}>⏳</div>}>
                 {(() => {
                   const gameType = (room as any).games?.game_type as GameType | undefined
                   const GameComponent = gameType ? GAME_COMPONENTS[gameType] : null
                   
                   if (!GameComponent) return <div className="text-center">Hệ thống chưa hỗ trợ chế độ chơi này trên máy chiếu 📽️</div>
                   return <GameComponent role="teacher" />
                 })()}
               </Suspense>
            )}
         </div>

         {/* Right col: Controls & Leaderboard */}
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
               <h3 style={{ margin: 0 }}>Điều khiển</h3>
               {room.status === 'waiting' && (
                 <button className="btn btn-success btn-lg" onClick={() => updateRoomStatus('playing')}>
                   <Play size={20}/> Bắt đầu Game
                 </button>
               )}
               {room.status === 'playing' && (
                 <>
                   <button className="btn btn-primary btn-lg" onClick={nextQuestion}>
                     <SkipForward size={20}/> Câu kế tiếp
                   </button>
                   <button className="btn btn-danger" onClick={() => updateRoomStatus('ended')}>
                     <Square size={20}/> Kết thúc
                   </button>
                 </>
               )}
            </div>

            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Leaderboard entries={leaderboardData} maxVisible={15} />
            </div>
         </div>

      </div>
    </div>
  )
}
