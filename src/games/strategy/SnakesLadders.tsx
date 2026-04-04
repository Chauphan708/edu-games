import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dices, Skull, ArrowUpRight } from 'lucide-react'

interface SnakesLaddersProps {
  role: 'teacher' | 'student'
}

// Bàn cờ 20 ô (Board Game)
const BOARD_SIZE = 20

// State các đội (Thực tế sẽ đồng bộ realtime)
const MOCK_TEAMS = [
  { id: 'T1', name: 'Đội Đỏ', color: '#EF476F', position: 5 },
  { id: 'T2', name: 'Đội Xanh', color: '#118AB2', position: 8 },
  { id: 'T3', name: 'Đội Vàng', color: '#FFD166', position: 2 },
]

export default function SnakesLadders({ role }: SnakesLaddersProps) {
  const [teams, setTeams] = useState(MOCK_TEAMS)

  // --- STUDENT VIEW ---
  // Góc nhìn học sinh: Giống GameWrapper bình thường trả lời câu hỏi trắc nghiệm
  // Nhưng thay vì tính Điểm, ta báo cho HS biết đội họ vừa được đổ xúc xắc (Roll dice) 
  if (role === 'student') {
    return (
      <div className="flex-col flex-center gap-xl" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
         <div className="badge" style={{ background: 'var(--bg-surface)', padding: '16px', fontSize: 'var(--text-xl)' }}>
            Bạn thuộc <strong style={{ color: '#EF476F' }}>Đội Đỏ</strong>
         </div>
         
         <div className="card text-center" style={{ width: '100%', padding: 'var(--space-2xl)' }}>
            <h3 style={{ marginBottom: 'var(--space-xl)' }}>Trả lời đúng để giúp đội tiến lên!</h3>
            <p>1 câu đúng = Nhích lên 1 bước</p>
            <p>Team trả lời nhanh nhất = Thưởng đổ Xúc xắc x2</p>
         </div>

         {/* Nút giả lập (Thực tế là Component Question) */}
         <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            Chờ câu hỏi từ giáo viên...
         </button>
      </div>
    )
  }

  // --- TEACHER VIEW (PROJECTOR) ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%', height: '100%' }}>
       <h2 style={{ fontSize: '3rem', marginBottom: 'var(--space-2xl)' }}><Dices size={40} style={{ verticalAlign: 'middle', marginRight: '16px' }}/> Cờ Đường Đua Cá Ngựa</h2>
       
       {/* Board Game Grid */}
       <div 
          style={{ 
             display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', 
             width: '800px', background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-xl)' 
          }}
       >
          {Array.from({ length: BOARD_SIZE }).map((_, index) => {
             const cellIndex = index + 1
             // Giả lập logic ô có bẫy hoặc thưởng
             const isTrap = cellIndex === 7 || cellIndex === 15
             const isBoost = cellIndex === 4 || cellIndex === 12
             
             // Xem đội nào đang đứng ô này
             const teamsHere = teams.filter(t => t.position === cellIndex)

             return (
               <div 
                  key={index} 
                  className="flex-center"
                  style={{ 
                    height: '80px', 
                    background: isTrap ? 'var(--color-danger-dark)' : isBoost ? 'var(--color-success-dark)' : 'var(--bg-card)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderRadius: 'var(--radius-md)',
                    position: 'relative'
                  }}
               >
                  <span style={{ position: 'absolute', top: 4, left: 8, fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>{cellIndex}</span>
                  
                  {isTrap && <Skull size={32} opacity={0.5} />}
                  {isBoost && <ArrowUpRight size={32} opacity={0.5} />}
                  {cellIndex === BOARD_SIZE && <span style={{ fontSize: '32px' }}>🏆</span>}

                  {/* Render Avatar/Token Của Các Đội */}
                  <div className="flex" style={{ position: 'absolute', bottom: -10, gap: '4px' }}>
                     {teamsHere.map(t => (
                       <motion.div 
                          layoutId={`team-${t.id}`}
                          key={t.id} 
                          style={{ 
                            width: '24px', height: '24px', borderRadius: '50%', background: t.color, 
                            border: '2px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                          }} 
                       />
                     ))}
                  </div>
               </div>
             )
          })}
       </div>

       <div className="flex gap-xl" style={{ marginTop: 'var(--space-3xl)' }}>
          {teams.map(t => (
            <div key={t.id} className="card" style={{ padding: '8px 24px', borderTop: `4px solid ${t.color}` }}>
               <h4 style={{ margin: 0, color: t.color }}>{t.name}</h4>
               <p style={{ margin: 0, fontWeight: 'bold' }}>Ô số {t.position}</p>
            </div>
          ))}
       </div>
    </div>
  )
}
