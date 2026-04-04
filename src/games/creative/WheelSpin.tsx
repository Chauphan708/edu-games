import { useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { RotateCw, Gift } from 'lucide-react'

interface WheelSpinProps {
  role: 'teacher' | 'student'
}

const WHEEL_PRIZES = ['+50 Điểm', 'Mất Lượt', 'Nhân Đôi', 'Trừ 10 Điểm', 'Cướp Quà', '+100 Điểm']

export default function WheelSpin({ role }: WheelSpinProps) {
  // --- STUDENT VIEW ---
  // Vòng quay là Game của Giáo viên (Trình chiếu), học sinh chỉ việc nín thở chờ đợi
  if (role === 'student') {
    return (
      <div className="flex-col flex-center text-center gap-xl" style={{ width: '100%', height: '100%' }}>
         <h3 style={{ fontSize: 'var(--text-3xl)' }}>Nhìn lên bảng!</h3>
         <div className="animate-bounceIn">
            <Gift size={64} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }} />
         </div>
         <p style={{ fontSize: 'var(--text-xl)', color: 'var(--text-secondary)' }}>Giáo viên đang quay Vòng Quay May Mắn...</p>
         <div className="badge badge-warning" style={{ marginTop: 'var(--space-2xl)', fontSize: 'var(--text-lg)' }}>
            Lưu ý: Có cả ô [Mất Điểm] đấy!
         </div>
      </div>
    )
  }

  // --- TEACHER VIEW (PROJECTOR) ---
  const controls = useAnimation()
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const spinWheel = async () => {
    if (isSpinning) return
    setIsSpinning(true)
    setResult(null)

    // Random số vòng quay: Quay khoảng 5-8 vòng + lệch một góc random
    const randomRotations = Math.floor(Math.random() * 5) + 5
    const randomAngle = Math.floor(Math.random() * 360)
    const targetRotation = randomRotations * 360 + randomAngle

    await controls.start({
       rotate: targetRotation,
       transition: { duration: 4, ease: [0.1, 0.9, 0.2, 1] } // Decelerate ease curve
    })

    const finalAngle = targetRotation % 360
    const sliceAngle = 360 / WHEEL_PRIZES.length
    const winIndex = Math.floor((360 - (finalAngle % 360)) / sliceAngle) % WHEEL_PRIZES.length

    setResult(WHEEL_PRIZES[winIndex])
    setIsSpinning(false)
  }

  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
       <h2 style={{ fontSize: '3.5rem', marginBottom: 'var(--space-3xl)' }}>Vòng Quay Nhân Phẩm</h2>
       
       <div style={{ position: 'relative' }}>
          {/* Mũi tên chỉ (Kim chỉ) */}
          <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
             <div style={{ width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderTop: '40px solid var(--color-danger)', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.5))' }} />
          </div>

          {/* Vòng quay CSS cơ bản */}
          <motion.div 
             animate={controls}
             style={{ 
               width: '500px', height: '500px', borderRadius: '50%', 
               background: 'conic-gradient(#EF476F 0 60deg, #FFD166 60deg 120deg, #06D6A0 120deg 180deg, #118AB2 180deg 240deg, #073B4C 240deg 300deg, #F78C6B 300deg 360deg)',
               border: '8px solid white',
               boxShadow: '0 0 40px rgba(0,0,0,0.5)',
               position: 'relative'
             }}
          >
             {/* Text bên trong vòng quay */}
             {WHEEL_PRIZES.map((prize, idx) => {
               const angle = (idx * (360 / WHEEL_PRIZES.length)) + (360 / WHEEL_PRIZES.length) / 2
               return (
                 <div 
                   key={idx}
                   style={{
                     position: 'absolute', width: '250px', height: '40px', left: '250px', top: '230px', transformOrigin: '0 50%',
                     transform: `rotate(${angle}deg)`, 
                     textAlign: 'right', paddingRight: '30px', fontWeight: 900, fontSize: '24px', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                   }}
                 >
                   {prize}
                 </div>
               )
             })}
          </motion.div>
       </div>

       {result && !isSpinning && (
          <motion.div initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: 0 }} className="card" style={{ marginTop: 'var(--space-2xl)', background: 'var(--bg-surface)' }}>
             <h3 style={{ fontSize: '2rem', margin: 0 }}>Kết quả: <span style={{ color: 'var(--color-success)', fontSize: '3rem' }}>{result}</span></h3>
          </motion.div>
       )}

       <button className="btn btn-primary btn-lg" style={{ marginTop: 'var(--space-3xl)' }} onClick={spinWheel} disabled={isSpinning}>
          <RotateCw size={24} className={isSpinning ? 'animate-spin' : ''} /> QUAY NGAY
       </button>
    </div>
  )
}
