import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GameComponentProps } from '../registry'

export default function SpeedQuiz({ role, question, onAnswer }: GameComponentProps) {
  const [timeLeft, setTimeLeft] = useState(10)
  
  // Tự động lấy timeLimit từ dữ liệu thật nếu có
  useEffect(() => {
    if (question?.timeLimit) setTimeLeft(question.timeLimit)
  }, [question])

  // --- STUDENT VIEW ---
  if (role === 'student' && question) {
    return (
      <div className="flex-col flex-center gap-xl" style={{ width: '100%', maxWidth: '800px' }}>
        <div className="flex flex-between w-full">
           <h2 style={{ fontSize: 'var(--text-3xl)' }}>{question.text}</h2>
        </div>

        <div className="grid grid-2 gap-md w-full">
          {question.options?.map((opt, idx) => (
            <motion.button
              key={idx}
              className="btn btn-secondary btn-lg"
              style={{ height: '120px', fontSize: 'var(--text-xl)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAnswer?.(opt)}
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // --- TEACHER VIEW ---
  return (
    <div className="flex-col flex-center text-center">
       <h1 style={{ fontSize: '4rem', marginBottom: 'var(--space-xl)' }}>{question?.text || 'Đang chờ câu hỏi...'}</h1>
       <div className="flex gap-xl">
          {question?.options?.map((opt, idx) => (
             <div key={idx} className="card" style={{ minWidth: '200px' }}>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold' }}>0</div>
                <div className="text-muted">{opt}</div>
             </div>
          ))}
       </div>
    </div>
  )
}
