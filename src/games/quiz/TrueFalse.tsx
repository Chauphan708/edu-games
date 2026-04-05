import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import type { GameComponentProps } from '../registry'

export default function TrueFalse({ role, question, onAnswer, disabled }: GameComponentProps) {
  // --- STUDENT VIEW ---
  if (role === 'student' && question) {
    return (
      <div className="flex-col flex-center gap-xl" style={{ width: '100%', maxWidth: '600px' }}>
        <h2 style={{ fontSize: 'var(--text-3xl)', textAlign: 'center' }}>{question.content}</h2>
        
        <div className="flex gap-lg w-full">
          <motion.button
            className="btn btn-lg flex-1"
            style={{ height: '150px', background: 'var(--color-success)', color: 'white', fontSize: '2rem' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={disabled}
            onClick={() => onAnswer?.(true)}
          >
            <Check size={48} /> ĐÚNG
          </motion.button>

          <motion.button
            className="btn btn-lg flex-1"
            style={{ height: '150px', background: 'var(--color-danger)', color: 'white', fontSize: '2rem' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={disabled}
            onClick={() => onAnswer?.(false)}
          >
            <X size={48} /> SAI
          </motion.button>
        </div>
      </div>
    )
  }

  // --- TEACHER VIEW ---
  return (
    <div className="flex-col flex-center text-center">
       <h1 style={{ fontSize: '4rem', marginBottom: 'var(--space-xl)' }}>{question?.content || 'Đang chờ...'}</h1>
       <div className="flex gap-3xl">
          <div className="flex-col items-center">
             <div style={{ fontSize: '5rem', color: 'var(--color-success)', fontWeight: 900 }}>0</div>
             <div className="badge badge-success">Đang chọn ĐÚNG</div>
          </div>
          <div className="flex-col items-center">
             <div style={{ fontSize: '5rem', color: 'var(--color-danger)', fontWeight: 900 }}>0</div>
             <div className="badge badge-danger">Đang chọn SAI</div>
          </div>
       </div>
    </div>
  )
}
