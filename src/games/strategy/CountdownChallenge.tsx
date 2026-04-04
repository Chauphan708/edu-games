import { useState, useEffect } from 'react'
import { Clock, Shield } from 'lucide-react'
import type { GameComponentProps } from '../registry'

export default function CountdownChallenge({ role }: GameComponentProps) {
  const [timeLeft, setTimeLeft] = useState(60)

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [timeLeft])

  return (
    <div className="flex-col flex-center text-center p-xl">
      <div className="game-card card bg-dark p-xl" style={{ width: '100%', maxWidth: '600px' }}>
         <h2 className="mb-md">Thử Thách Đếm Ngược</h2>
         <p className="mb-xl">Giải các trạm đố trước khi thời gian kết thúc!</p>

         <div className="countdown-timer flex-center gap-md" style={{ fontSize: '4rem', fontWeight: 800 }}>
            <Clock size={48} color={timeLeft < 10 ? 'var(--color-danger)' : 'var(--color-primary)'} />
            <span>00:{timeLeft.toString().padStart(2, '0')}</span>
         </div>

         <div className="grid grid-4 gap-md mt-2xl">
            {[1, 2, 3, 4].map(station => (
               <div key={station} className="card p-md bg-surface text-center">
                  <Shield size={24} />
                  <p>Trạm {station}</p>
               </div>
            ))}
         </div>

         {role === 'teacher' && (
           <p className="mt-xl" style={{ color: 'var(--color-success)' }}>
             Chế độ giáo viên: Giám sát thời gian hoàn thành của lớp
           </p>
         )}
      </div>
    </div>
  )
}
