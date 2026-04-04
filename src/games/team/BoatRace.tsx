import { useState } from 'react'
import { motion } from 'framer-motion'
import { Ship, Flag } from 'lucide-react'

interface BoatRaceProps {
  role: 'teacher' | 'student'
}

const MOCK_BOATS = [
  { id: 'T1', name: 'Thuyền Đỏ', progress: 80, color: 'var(--color-danger)' },
  { id: 'T2', name: 'Thuyền Xanh', progress: 45, color: 'var(--color-primary)' },
  { id: 'T3', name: 'Thuyền Vàng', progress: 60, color: 'var(--color-warning)' },
]

export default function BoatRace({ role }: BoatRaceProps) {
  const [boats, setBoats] = useState(MOCK_BOATS)

  // --- STUDENT VIEW ---
  // Ở góc nhìn học sinh, đây là game trắc nghiệm truyền thống
  // Nhưng giao diện được "reskin" lại thành phong cách đua thuyền chèo lái
  if (role === 'student') {
    return (
      <div className="flex-col gap-xl" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
        <div className="badge text-center" style={{ width: '100%', padding: '16px', fontSize: 'var(--text-xl)', background: 'var(--bg-surface)' }}>
           Bạn đang chèo <strong style={{ color: 'var(--color-danger)' }}>Thuyền Đỏ</strong>
        </div>
        
        <div className="card text-center" style={{ padding: 'var(--space-2xl)', fontSize: 'var(--text-2xl)' }}>
          Hiện tượng thủy triều sinh ra do lực nào?
        </div>

        <div className="flex-col gap-sm">
           {['Lực Trái Đất', 'Lực Hấp Dẫn Mặt Trăng', 'Sóng Biển', 'Sức Gió'].map(opt => (
              <button key={opt} className="btn btn-secondary btn-lg" style={{ height: '70px', justifyContent: 'flex-start' }}>
                {opt}
              </button>
           ))}
        </div>
        <p className="text-center text-muted">Trả lời thật nhanh để Thuyền vọt lên!</p>
      </div>
    )
  }

  // --- TEACHER VIEW (PROJECTOR) ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
       <h2 style={{ fontSize: '3.5rem', marginBottom: 'var(--space-3xl)' }}>Giải Đua Thuyền Đỉnh Cao</h2>
       
       <div className="flex-col gap-xl" style={{ width: '900px', background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
          {boats.map(boat => (
             <div key={boat.id} className="flex items-center gap-md">
                
                {/* Tên Đội */}
                <div style={{ width: '120px', fontWeight: 800, fontSize: '1.2rem', color: boat.color, textAlign: 'right' }}>
                   {boat.name}
                </div>
                
                {/* Làn Đua (Track) */}
                <div style={{ flex: 1, position: 'relative', height: '60px', background: 'rgba(17, 138, 178, 0.2)', borderRadius: '30px', overflow: 'hidden', border: '2px solid rgba(17, 138, 178, 0.4)' }}>
                   
                   {/* Dòng nước cuộn (Wave background) */}
                   <div style={{ position: 'absolute', top: 0, left: 0, width: '200%', height: '100%', background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' }} />

                   {/* Chiếc Thuyền */}
                   <motion.div 
                      style={{ 
                        position: 'absolute', top: '10px', left: 0, width: '40px', height: '40px',
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                      }}
                      animate={{ 
                        left: `calc(${boat.progress}% - 20px)`,
                        rotate: [-2, 2, -2], // Thuyền lắc lư
                        y: [-2, 2, -2]       // Nhấp nhô theo sóng
                      }}
                      transition={{ 
                        left: { duration: 0.5, ease: 'easeOut' },
                        rotate: { repeat: Infinity, duration: 2 },
                        y: { repeat: Infinity, duration: 1.5 }
                      }}
                   >
                     <Ship size={40} color={boat.color} fill={boat.color} />
                   </motion.div>
                </div>
                
                {/* Đích Đến */}
                <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                   <Flag size={32} color={boat.progress >= 100 ? 'var(--color-success)' : 'var(--text-muted)'} />
                </div>
             </div>
          ))}
       </div>
    </div>
  )
}
