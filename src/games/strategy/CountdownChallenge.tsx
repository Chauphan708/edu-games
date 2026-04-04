import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hourglass, Lock, Unlock, AlertOctagon } from 'lucide-react'

interface CountdownChallengeProps {
  role: 'teacher' | 'student'
}

const TOTAL_STATIONS = 5

export default function CountdownChallenge({ role }: CountdownChallengeProps) {
  const [timeLeft, setTimeLeft] = useState(120) // 2 Phút
  const [currentStation, setCurrentStation] = useState(2) // Đang ở trạm 2

  // Simulate Timer
  useEffect(() => {
    if (timeLeft <= 0 || currentStation > TOTAL_STATIONS) return
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, currentStation])

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const isDanger = timeLeft <= 30
  const isFailed = timeLeft <= 0
  const isSuccess = currentStation > TOTAL_STATIONS

  // --- STUDENT VIEW ---
  if (role === 'student') {
    return (
      <div className="flex-col flex-center gap-xl" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
         <div className={`card ${isDanger ? 'animate-pulse' : ''}`} style={{ borderColor: isDanger ? 'var(--color-danger)' : 'var(--border-color)', width: '100%' }}>
            <h3 style={{ margin: 0, color: isDanger ? 'var(--color-danger)' : 'var(--text-primary)' }}>
              <Hourglass size={20} style={{ verticalAlign: 'middle' }}/> Thời gian còn lại: {formatTime(timeLeft)}
            </h3>
         </div>

         {isFailed ? (
           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-danger" style={{ fontSize: 'var(--text-3xl)' }}>
              <AlertOctagon size={64}/> HẾT GIỜ!
           </motion.div>
         ) : isSuccess ? (
           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-success" style={{ fontSize: 'var(--text-3xl)' }}>
              🎉 CHÚC MỪNG! ĐÃ PHÁ ĐẢO!
           </motion.div>
         ) : (
           <div className="flex-col w-full gap-md">
             <div className="badge badge-warning" style={{ fontSize: 'var(--text-lg)' }}>Đang giải mã Trạm {currentStation} / {TOTAL_STATIONS}</div>
             <p className="text-secondary">Ai là người viết "Truyện Kiều"?</p>
             
             {/* Options */}
             <div className="flex-col gap-sm" style={{ marginTop: 'var(--space-md)' }}>
                {['Nguyễn Trãi', 'Nguyễn Du', 'Hồ Xuân Hương'].map(opt => (
                  <button key={opt} className="btn btn-secondary btn-lg">{opt}</button>
                ))}
             </div>
           </div>
         )}
      </div>
    )
  }

  // --- TEACHER VIEW (PROJECTOR) ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%', height: '100%' }}>
       
       <motion.div 
         className="flex-center flex-col"
         animate={isDanger ? { rotate: [-2, 2, -2] } : {}}
         transition={{ repeat: Infinity, duration: 0.5 }}
       >
         <h1 style={{ 
           fontSize: '8rem', 
           margin: 0,
           color: isDanger ? 'var(--color-danger)' : 'var(--text-primary)',
           textShadow: isDanger ? '0 0 40px rgba(239, 71, 111, 0.8)' : 'none',
           fontVariantNumeric: 'tabular-nums'
         }}>
           {formatTime(timeLeft)}
         </h1>
         {isDanger && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--text-2xl)', fontWeight: 'bold', marginTop: 'var(--space-sm)' }}>NGUY HIỂM KẬN KỀ!!!</p>}
       </motion.div>

       {/* Progress Hành trình */}
       <div className="flex gap-md items-center" style={{ marginTop: 'var(--space-3xl)', background: 'var(--bg-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-xl)' }}>
          {Array.from({ length: TOTAL_STATIONS }).map((_, index) => {
             const stationNum = index + 1
             const isPassed = stationNum < currentStation
             const isCurrent = stationNum === currentStation

             return (
               <div key={index} className="flex-center flex-col gap-sm">
                  <div style={{ 
                    width: '60px', height: '60px', borderRadius: '50%', 
                    background: isPassed ? 'var(--color-success)' : isCurrent ? 'var(--color-warning)' : 'var(--bg-card)',
                    border: '4px solid',
                    borderColor: isPassed ? 'var(--color-success-dark)' : isCurrent ? 'var(--color-warning-dark)' : 'var(--border-color)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                  }}>
                     {isPassed ? <Unlock size={24} color="white"/> : <Lock size={24} color={isCurrent ? '#000' : 'var(--text-muted)'}/>}
                  </div>
                  <span style={{ fontSize: 'var(--text-sm)', color: isPassed ? 'var(--color-success)' : 'var(--text-muted)', fontWeight: isCurrent ? 'bold' : 'normal' }}>
                     Trạm {stationNum}
                  </span>
               </div>
             )
          })}
       </div>
    </div>
  )
}
