import { useEffect, useState, Suspense, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Trophy, Star, ArrowRight } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useRoom } from '../../hooks/useRoom'
import { useGameStore } from '../../store/gameStore'
import { GAME_COMPONENTS } from '../../games/registry'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useSound } from '../../hooks/useSound'
import { calculatePoints } from '../../lib/scoring'
import type { GameType } from '../../types/supabase'

export default function GameWrapper() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const { room, fetchRoom } = useRoom()
  const { currentParticipant, updateParticipant } = useGameStore()
  const { coins: totalCoins, setAuth } = useAuth()
  const { playCorrect, playWrong, playWin, playCollect } = useSound()
  
  // Local state flow
  const [answered, setAnswered] = useState(false)
  const [hasSavedAttempt, setHasSavedAttempt] = useState(false)
  
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
          })
      }, 2000)
      return () => clearInterval(interval)
  }, [roomCode, room?.current_question])

  // --- LOGIC GHI NHẬN ĐIỂM SỐ KHI KẾT THÚC ---
  useEffect(() => {
      if (room?.status === 'ended' && currentParticipant && room.games && !hasSavedAttempt) {
          setHasSavedAttempt(true);
          playWin();
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#FF4500']
          });

          (supabase.from('game_attempts') as any).insert({
              student_id: currentParticipant.user_id,
              teacher_id: room.teacher_id,
              class_id: room.class_id,
              room_id: room.id,
              game_id: room.game_id,
              game_type: room.games.game_type,
              score: currentParticipant.score,
              accuracy_rate: 0, 
          }).then(({ error }: any) => {
              if (error) console.error("Lỗi đồng bộ điểm tích luỹ:", error)
          })
      }
  }, [room?.status, currentParticipant, room, hasSavedAttempt])

  const handleAnswer = useCallback((answer: any) => {
      if (answered || !room || !currentParticipant) return
      setAnswered(true)
      
      const questions = room.games?.questions as any[] || []
      const currentQuestion = questions[room.current_question]
      if (!currentQuestion) return

      // Kiểm tra đáp án (Đơn giản hoá)
      let isCorrect = false
      if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') {
          isCorrect = String(answer) === String(currentQuestion.correct_index)
      } else {
          isCorrect = JSON.stringify(answer) === JSON.stringify(currentQuestion.correct_index)
      }

      // 1. Tính điểm = 1 x Mức độ (Difficulty)
      const points = calculatePoints(isCorrect, currentQuestion.difficulty || 1)
      const coinReward = isCorrect ? 10 : 0; // Thưởng 10 Xu nếu đúng

      if (isCorrect) {
        playCorrect();
        playCollect();
      } else {
        playWrong();
      }

      // 2. Cập nhật Store & CSDL (Không đợi await để UI mượt)
      const newScore = (currentParticipant.score || 0) + points
      updateParticipant(currentParticipant.id, { score: newScore })
      ;(supabase.from('participants') as any).update({ score: newScore }).eq('id', currentParticipant.id).then()
      
      // Cập nhật Xu vĩnh viễn cho học sinh
      if (coinReward > 0 && currentParticipant.user_id) {
        const newTotalCoins = (totalCoins || 0) + coinReward;
        setAuth({ coins: newTotalCoins });
        (supabase.from('student_gamification') as any)
          .update({ coins: newTotalCoins })
          .eq('user_id', currentParticipant.user_id)
          .then();
      }

      // 3. Ghi lịch sử submission chi tiết
      ;(supabase.from('submissions') as any).insert({
          room_id: room.id,
          participant_id: currentParticipant.id,
          question_index: room.current_question,
          answer: answer,
          is_correct: isCorrect,
          points_earned: points,
      }).then()

  }, [answered, room, currentParticipant, updateParticipant, totalCoins, setAuth])

  if (!room || !currentParticipant) {
      return <div className="page flex flex-center"><div className="loader"></div></div>
  }

  // --- MÀN HÌNH TỔNG KẾT SAU KHI GAME ENDED ---
  if (room.status === 'ended') {
      return (
         <div className="page flex-center p-xl" style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
             <div className="card text-center" style={{ maxWidth: 500, padding: 'var(--space-2xl)' }}>
                 <div className="flex-center mb-md">
                     <Trophy size={64} style={{ color: 'var(--color-warning)' }} />
                 </div>
                 <h1 className="mb-sm">Hoàn Thành Trò Chơi!</h1>
                 <p className="text-lg mb-xl">Làm tốt lắm, <b>{currentParticipant.player_name}</b>!</p>
                 
                 <div className="bg-surface p-xl mb-xl" style={{ borderRadius: 'var(--radius-lg)' }}>
                     <div className="flex flex-between items-center mb-md">
                         <span className="text-secondary flex items-center gap-sm"><Star size={20} /> Điểm tích luỹ của bạn:</span>
                         <span className="badge badge-primary" style={{ fontSize: '1.5rem', padding: '12px 20px' }}>
                             {currentParticipant.score} điểm
                         </span>
                     </div>
                     <div className="text-left text-sm text-secondary" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-md)' }}>
                         <b>💡 Cách tính điểm:</b>
                         <p className="mt-xs">Hệ thống áp dụng <b>"Chơi nhiều, tích luỹ nhanh"</b>. Mỗi câu đúng cơ bản được 1 điểm. Điểm này nhân với hệ số câu hỏi:</p>
                         <ul className="mt-xs pl-md" style={{ listStyle: 'disc' }}>
                             <li>Mức 1 (Nhận biết): x1</li>
                             <li>Mức 2 (Kết nối): x2</li>
                             <li>Mức 3 (Vận dụng): x3</li>
                         </ul>
                     </div>
                 </div>
                 
                 <button className="btn btn-primary btn-lg w-full" onClick={() => navigate('/arena')}>
                     <ArrowRight size={20} /> Về Trang Chủ
                 </button>
             </div>
         </div>
      )
  }

  // --- GAMEPLAY MÀN HÌNH CHÍNH ---
  const roomData = room as any
  const gameType = roomData.games?.game_type as GameType | undefined
  const questions = roomData.games?.questions as any[] || []
  const currentQuestion = questions[room.current_question]
  
  const GameComponent = gameType ? GAME_COMPONENTS[gameType] : null

  return (
    <div className="page flex-col" style={{ height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>
       <div className="flex flex-between" style={{ padding: 'var(--space-md) var(--space-xl)', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-md">
             <div className="badge badge-quiz">Câu {room.current_question + 1} / {questions.length}</div>
             <div className="text-muted text-sm">Phòng: {room.room_code}</div>
          </div>
          <div className="badge text-lg" style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}>
             ⭐ {currentParticipant.score}
          </div>
       </div>

       <div className="flex-1 flex-center p-xl relative">
          <Suspense fallback={<div className="loader"></div>}>
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

          {/* Bottom Overlay khi đã trả lời xong */}
          {answered && (
            <div className="absolute" style={{ bottom: 30, background: 'var(--bg-surface)', padding: '16px 32px', borderRadius: '40px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--color-primary)' }}>
               Đã nộp đáp án! Chờ giáo viên chuyển câu...
            </div>
          )}
       </div>
    </div>
  )
}
