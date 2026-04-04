import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { GameComponentProps } from '../registry'

export default function SpeedQuiz({ role }: GameComponentProps) {
  const [score, setScore] = useState(0)

  useEffect(() => {
    // Logic for speed test (placeholder)
    if (role === 'student') {
        const interval = setInterval(() => setScore(prev => prev + 10), 5000)
        return () => clearInterval(interval)
    }
  }, [role])

  return (
    <div className="flex-col flex-center text-center p-xl">
      <div className="game-card card bg-dark p-xl" style={{ width: '100%', maxWidth: '600px' }}>
         <h2 className="mb-md">Trắc Nghiệm Tốc Độ</h2>
         <p className="mb-xl">Trả lời càng nhanh, điểm càng cao!</p>

         <div className="score-board flex-center" style={{ width: '200px', height: '200px', borderRadius: '50%', border: '8px solid var(--color-primary)', margin: '0 auto', fontSize: '3rem', fontWeight: 800 }}>
            {score}
         </div>

         {role === 'teacher' && (
           <p className="mt-xl" style={{ color: 'var(--color-success)' }}>
             Chế độ giáo viên: Theo dõi điểm số real-time của học sinh
           </p>
         )}
      </div>

      <div className="mt-xl flex gap-md">
         <button className="btn btn-primary btn-lg" onClick={() => setScore(prev => prev + 100)}>
            Click nhanh để nhận điểm!
         </button>
      </div>
    </div>
  )
}
