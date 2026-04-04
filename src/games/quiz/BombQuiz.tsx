import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bomb, ShieldCheck } from 'lucide-react'
import type { GameComponentProps } from '../registry'

export default function BombQuiz({ role }: GameComponentProps) {
  const [timeLeft, setTimeLeft] = useState(20)
  const [exploded, setExploded] = useState(false)
  const [defused, setDefused] = useState(false)

  useEffect(() => {
    if (role === 'student' && timeLeft > 0 && !defused) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && !defused) {
      setExploded(true)
    }
  }, [timeLeft, role, defused])

  if (exploded) {
    return (
      <div className="flex-center full-height">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }} className="text-center">
          <h2 style={{ color: 'var(--color-danger)', fontSize: '4rem' }}>💥 BUÙM!</h2>
          <p>Quả bom đã nổ! Chúc mừng bạn... đã hy sinh.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-col flex-center text-center p-xl">
      <div style={{ position: 'relative', marginBottom: 'var(--space-2xl)' }}>
        <motion.div
           animate={{ scale: [1, 1.1, 1] }}
           transition={{ duration: 0.5, repeat: Infinity }}
        >
          <Bomb size={120} color={timeLeft < 5 ? 'var(--color-danger)' : 'var(--text-primary)'} />
        </motion.div>
        <div className="bomb-timer" style={{ 
          position: 'absolute', top: '50%', left: '50%', 
          transform: 'translate(-50%, -50%)', fontWeight: 800, fontSize: '2rem' 
        }}>
          {timeLeft}
        </div>
      </div>

      <h2>Tháo gỡ quả bom!</h2>
      <p style={{ marginBottom: 'var(--space-2xl)' }}>Chọn đáp án đúng nhất để cắt dây bom an toàn</p>

      {/* Placeholder cho câu hỏi */}
      <div className="grid grid-2 gap-md" style={{ width: '100%', maxWidth: '500px' }}>
         {['Dây Đỏ', 'Dây Xanh', 'Dây Vàng', 'Dây Đen'].map((wire, idx) => (
            <button key={idx} className="btn btn-secondary btn-lg" onClick={() => setDefused(true)}>
               {wire}
            </button>
         ))}
      </div>

      {defused && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge badge-success mt-xl">
             <ShieldCheck size={20} /> Đã gỡ bom an toàn!
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
