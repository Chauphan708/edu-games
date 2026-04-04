import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flag, Rocket } from 'lucide-react'
import type { GameComponentProps } from '../registry'

export default function QuizRace({ role }: GameComponentProps) {
  const [progress, setProgress] = useState(0)

  return (
    <div className="flex-col flex-center text-center p-xl">
      <div className="game-card card bg-dark p-xl" style={{ width: '100%', maxWidth: '600px' }}>
         <h2 className="mb-md">Đua Top Tri Thức</h2>
         <p className="mb-xl">Mỗi câu trả lời đúng sẽ giúp phi thuyền của bạn tiến xa hơn!</p>

         <div className="race-track" style={{ height: '300px', width: '100%', background: '#111', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
            <motion.div 
               animate={{ y: -progress }} 
               style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}
            >
               <Rocket size={48} color="var(--color-primary)" />
            </motion.div>
            <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)' }}>
               <Flag size={32} color="var(--color-success)" />
            </div>
         </div>

         {role === 'teacher' && (
           <p className="mt-xl" style={{ color: 'var(--color-success)' }}>
             Chế độ giáo viên: Theo dõi trực tiếp cuộc đua của học sinh
           </p>
         )}
      </div>

      <div className="mt-xl flex gap-md">
         <button className="btn btn-primary" onClick={() => setProgress(prev => Math.min(prev + 50, 250))}>
            Trình diễn tiến độ
         </button>
      </div>
    </div>
  )
}
