import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bomb, AlertTriangle, ShieldCheck } from 'lucide-react'
import type { GameComponentProps } from '../registry'

export default function BombQuiz({ role, question, onAnswer }: GameComponentProps) {
  const [timeLeft, setTimeLeft] = useState(20)
  const [exploded, setExploded] = useState(false)
  const [defused, setDefused] = useState(false)

  // Đếm ngược bom
  useEffect(() => {
    if (exploded || defused) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setExploded(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [exploded, defused])

  // --- STUDENT VIEW ---
  if (role === 'student') {
    const handleAnswer = (idx: number) => {
       if (exploded || defused) return
       // Giả sử 1 là mốc đúng
       if (idx === 1) {
         setDefused(true) // Gỡ thành công!
       } else {
         // Phạt: Chọn sai trừ 5 giây ngay lập tức (Panic mode)
         setTimeLeft(prev => Math.max(0, prev - 5))
       }
    }

    return (
      <div className="flex-col flex-center gap-xl" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        
        {/* Visual Bom */}
        <div style={{ position: 'relative', marginTop: 'var(--space-xl)' }}>
          <AnimatePresence>
            {!exploded && !defused && (
              <motion.div 
                className={`animate-pulse ${timeLeft <= 5 ? 'animate-shake' : ''}`}
                style={{ color: timeLeft <= 5 ? 'var(--color-danger)' : 'var(--text-primary)' }}
                exit={{ scale: 2, opacity: 0 }}
              >
                <Bomb size={120} />
                <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, marginTop: '-20px' }}>
                  00:{timeLeft.toString().padStart(2, '0')}
                </div>
              </motion.div>
            )}
            
            {exploded && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="animate-bounceIn" style={{ color: 'var(--color-danger)' }}>
                <span style={{ fontSize: '100px' }}>💥</span>
                <h2>BÙM! BẠN ĐÃ CHẬM TUYẾN</h2>
              </motion.div>
            )}

            {defused && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="animate-bounceIn" style={{ color: 'var(--color-success)' }}>
                <ShieldCheck size={120} />
                <h2>ĐÃ GỠ BOM THÀNH CÔNG!</h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Options */}
        {(!exploded && !defused) && (
          <div className="grid grid-2 gap-md" style={{ width: '100%', marginTop: 'var(--space-md)' }}>
            {['H2O', 'CO2 (Đúng)', 'O2', 'N2'].map((text, idx) => (
              <motion.button 
                key={idx}
                className="btn btn-lg btn-secondary"
                style={{ height: '80px', fontSize: 'var(--text-xl)', borderColor: 'var(--color-danger-light)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(idx)}
              >
                {text}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // --- TEACHER VIEW ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%', height: '100%' }}>
       <h2 style={{ fontSize: '3rem', marginBottom: 'var(--space-2xl)' }}>Khí nào tham gia hiệu ứng nhà kính?</h2>
       
       <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Bomb size={200} style={{ color: timeLeft <= 5 ? 'var(--color-danger)' : 'var(--text-primary)' }} className={timeLeft <= 5 ? 'animate-shake' : ''} />
          
          <div style={{ 
             fontSize: '5rem', 
             fontFamily: 'var(--font-display)', 
             fontWeight: 900,
             color: timeLeft <= 5 ? 'var(--color-danger)' : 'var(--color-warning)',
             textShadow: timeLeft <= 5 ? '0 0 20px rgba(239, 71, 111, 0.5)' : 'none',
             marginTop: '-20px'
          }}>
             {timeLeft}
          </div>
       </div>

       <div className="flex flex-center gap-md" style={{ marginTop: 'var(--space-2xl)' }}>
          <span className="badge badge-success" style={{ fontSize: 'var(--text-lg)', padding: '12px 24px' }}>
            Đã gỡ an toàn: 15 HS
          </span>
          <span className="badge badge-danger" style={{ fontSize: 'var(--text-lg)', padding: '12px 24px' }}>
            Đã phát nổ: 5 HS
          </span>
       </div>
    </div>
  )
}
