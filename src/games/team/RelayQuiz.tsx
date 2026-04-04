import { motion } from 'framer-motion'
import { FastForward, UserCheck } from 'lucide-react'
import type { GameComponentProps } from '../registry'

export default function RelayQuiz({ role }: GameComponentProps) {
  return (
    <div className="flex-col flex-center text-center p-xl">
      <div className="game-card card bg-dark p-xl" style={{ width: '100%', maxWidth: '600px' }}>
         <h2 className="mb-md">Tiếp Sức Tri Thức</h2>
         <p className="mb-xl">Phối hợp cùng đồng đội để hoàn thành gói câu hỏi nhanh nhất!</p>

         <div className="relay-track flex gap-lg p-xl bg-surface" style={{ borderRadius: 'var(--radius-lg)' }}>
            {[1, 2, 3].map(player => (
               <div key={player} className="flex-col items-center">
                  <UserCheck size={32} color={player === 1 ? 'var(--color-primary)' : 'var(--text-muted)'} />
                  <span>Người chơi {player}</span>
                  {player === 1 && <span className="badge badge-primary">Đang trả lời</span>}
               </div>
            ))}
         </div>

         <div className="mt-2xl">
            <motion.button animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity }} className="btn btn-secondary">
               <FastForward size={20} /> Chuyền lượt cho đồng đội
            </motion.button>
         </div>

         {role === 'teacher' && (
           <p className="mt-xl" style={{ color: 'var(--color-success)' }}>
             Chế độ giáo viên: Theo dõi quá trình "chuyền gậy" của lớp
           </p>
         )}
      </div>
    </div>
  )
}
