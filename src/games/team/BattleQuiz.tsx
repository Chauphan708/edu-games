import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Crosshair, ShieldAlert } from 'lucide-react'

interface BattleQuizProps {
  role: 'teacher' | 'student'
}

const MOCK_TEAMS = [
  { id: 'T1', name: 'Liên Minh', hp: 100, maxHp: 100, color: 'var(--color-primary)' },
  { id: 'T2', name: 'Đế Quốc', hp: 40, maxHp: 100, color: 'var(--color-danger)' },
]

export default function BattleQuiz({ role }: BattleQuizProps) {
  // --- STUDENT VIEW ---
  if (role === 'student') {
    const [answered, setAnswered] = useState(false)
    const [target, setTarget] = useState<string | null>(null) // Chế độ nhắm bắn

    const handleShoot = () => {
       if (!target) return
       // Gửi action đánh 'target' lên server
       setAnswered(true)
    }

    return (
      <div className="flex-col flex-center gap-xl" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
         {/* HP Bar của bản thân */}
         <div className="card" style={{ width: '100%', padding: 'var(--space-md)' }}>
           <div className="flex flex-between mb-sm">
             <strong style={{ color: 'var(--color-primary)' }}>Phòng thủ (Liên Minh)</strong>
             <span className="text-secondary"><Heart size={16} color="var(--color-danger)" fill="var(--color-danger)"/> 100/100</span>
           </div>
           <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px' }}>
             <div style={{ height: '100%', width: '100%', background: 'var(--color-success)', borderRadius: '4px' }}/>
           </div>
         </div>

         {answered ? (
           <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="badge badge-success" style={{ fontSize: 'var(--text-xl)', padding: '16px' }}>
             BÙM! Đã khai hỏa. Chờ nạp đạn...
           </motion.div>
         ) : (
           <>
             {/* Trả lời câu hỏi (Ví dụ đã trả lời đúng và sang phase ngắm bắn) */}
             <div className="card" style={{ width: '100%', borderColor: 'var(--color-warning)' }}>
                <h3 style={{ margin: 0, marginBottom: 'var(--space-md)' }}><Crosshair size={24} style={{ verticalAlign: 'middle' }}/> Nhắm Bắn</h3>
                <p className="text-secondary">Bạn trả lời đúng. Hãy chọn mục tiêu để trừ 20 HP của họ!</p>
                
                <div className="flex gap-md" style={{ marginTop: 'var(--space-xl)' }}>
                   <button 
                     className={`btn ${target === 'T2' ? 'btn-danger' : 'btn-secondary'}`} 
                     style={{ flex: 1 }}
                     onClick={() => setTarget('T2')}
                   >
                     Bắn Đế Quốc (40 HP)
                   </button>
                   <button 
                     className="btn btn-primary" 
                     disabled={!target}
                     onClick={handleShoot}
                   >
                     KHAI HỎA
                   </button>
                </div>
             </div>
           </>
         )}
      </div>
    )
  }

  // --- TEACHER VIEW (PROJECTOR) ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%', height: '100%' }}>
       <h2 style={{ fontSize: '3.5rem', marginBottom: 'var(--space-3xl)' }}><ShieldAlert size={48} style={{ color: 'var(--color-warning)', verticalAlign: '-10px' }}/> ĐẠI CHIẾN</h2>
       
       <div className="flex flex-center gap-3xl">
          {MOCK_TEAMS.map(team => {
             const isLowHP = team.hp <= 40
             return (
               <div key={team.id} className="card" style={{ width: '350px', background: 'rgba(0,0,0,0.5)', borderColor: team.color, borderWidth: '2px' }}>
                  <h2 style={{ color: team.color, marginTop: 0 }}>{team.name}</h2>
                  
                  <div style={{ position: 'relative', margin: 'var(--space-xl) 0' }}>
                    <div style={{ width: '100%', height: '40px', background: 'var(--bg-input)', borderRadius: '20px', overflow: 'hidden' }}>
                       <motion.div 
                          style={{ height: '100%', background: isLowHP ? 'var(--color-danger)' : team.color }}
                          animate={{ width: `${(team.hp / team.maxHp) * 100}%` }}
                          transition={{ duration: 0.5 }}
                       />
                    </div>
                    {/* Con số HP đè lên trên thanh */}
                    <div className="flex flex-center" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', fontWeight: 900, fontSize: '1.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                       {team.hp} / {team.maxHp}
                    </div>
                  </div>

                  <AnimatePresence>
                     {isLowHP && (
                        <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-danger animate-pulse" style={{ fontWeight: 800 }}
                        >
                          CẢNH BÁO: SẮP BỊ TIÊU DIỆT!
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
             )
          })}
       </div>

       <p className="text-secondary" style={{ marginTop: 'var(--space-3xl)', fontSize: 'var(--text-xl)' }}>Học sinh bên dưới đã bắt đầu khai hỏa...</p>
    </div>
  )
}
