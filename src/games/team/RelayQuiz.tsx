import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Users, ArrowRight } from 'lucide-react'

interface RelayQuizProps {
  role: 'teacher' | 'student'
}

const MOCK_TEAMS = [
  { id: 'T1', name: 'Đội Đỏ', members: ['An', 'Bình', 'Châu'], currentIndex: 0, progress: 0 },
  { id: 'T2', name: 'Đội Xanh', members: ['Dũng', 'Ân', 'Phúc'], currentIndex: 1, progress: 30 },
]

export default function RelayQuiz({ role }: RelayQuizProps) {
  // --- STUDENT VIEW ---
  if (role === 'student') {
    // Giả lập trạng thái: Học sinh này có phải người đang tới lượt không?
    const isMyTurn = true 

    if (!isMyTurn) {
       return (
         <div className="flex-col flex-center text-center gap-xl" style={{ width: '100%', height: '100%', padding: 'var(--space-2xl)' }}>
            <div className="badge badge-team" style={{ background: 'var(--bg-surface)', padding: '16px' }}>Bạn thuộc Đội Đỏ</div>
            <Users size={64} style={{ color: 'var(--color-primary)', opacity: 0.5 }} />
            <h3 style={{ fontSize: 'var(--text-2xl)' }}>Đang tới lượt của: <strong style={{ color: 'var(--color-primary)' }}>Bạn An</strong></h3>
            <p className="text-secondary">Hãy cổ vũ cho đồng đội của mình! Khi nào An trả lời xong mới tới lượt bạn.</p>
         </div>
       )
    }

    return (
      <div className="flex-col gap-xl" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
        <div className="badge badge-warning text-center" style={{ width: '100%', padding: '16px', fontSize: 'var(--text-xl)', animation: 'pulse 2s infinite' }}>
           🔥 ĐẾN LƯỢT BẠN CHẠY! 🔥
        </div>
        
        <div className="card text-center" style={{ padding: 'var(--space-2xl)', fontSize: 'var(--text-2xl)' }}>
          "Đường cách mệnh" là tác phẩm của ai?
        </div>

        <div className="grid grid-2 gap-md">
           {['Hồ Chí Minh', 'Võ Nguyên Giáp', 'Phạm Văn Đồng', 'Trường Chinh'].map(opt => (
              <button key={opt} className="btn btn-secondary btn-lg" style={{ height: '80px' }}>
                {opt}
              </button>
           ))}
        </div>
      </div>
    )
  }

  // --- TEACHER VIEW (PROJECTOR) ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%' }}>
       <h2 style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>Chạy Tiếp Sức Nhóm</h2>
       <p className="text-muted" style={{ marginBottom: 'var(--space-3xl)' }}>Mỗi học sinh trả lời 1 câu để chuyền gậy cho người tiếp theo!</p>
       
       <div className="flex-col gap-xl" style={{ width: '800px' }}>
          {MOCK_TEAMS.map(team => (
            <div key={team.id} className="card flex items-center gap-xl" style={{ background: 'var(--bg-surface)', padding: '0', overflow: 'hidden' }}>
               
               {/* Header Thông tin đội */}
               <div className="flex-col flex-center" style={{ width: '150px', background: 'rgba(0,0,0,0.2)', padding: 'var(--space-xl)', height: '100%' }}>
                 <strong style={{ fontSize: '1.5rem', color: team.id === 'T1' ? 'var(--color-danger)' : 'var(--color-primary)' }}>{team.name}</strong>
               </div>
               
               {/* Progress Bar Gậy Tiếp Sức */}
               <div style={{ flex: 1, padding: 'var(--space-xl) var(--space-xl) var(--space-xl) 0', position: 'relative' }}>
                  
                  {/* Danh sách thành viên chốt trạm */}
                  <div className="flex flex-between" style={{ position: 'relative', zIndex: 2, padding: '0 20px' }}>
                     {team.members.map((member, idx) => {
                        const isActive = idx === team.currentIndex
                        const isPassed = idx < team.currentIndex
                        return (
                          <div key={idx} className="flex-col flex-center gap-sm">
                             <motion.div 
                               style={{ 
                                 width: '40px', height: '40px', borderRadius: '50%',
                                 background: isPassed ? 'var(--color-success)' : isActive ? 'var(--color-warning)' : 'var(--bg-input)',
                                 border: '3px solid', borderColor: isActive ? 'white' : 'transparent',
                                 display: 'flex', justifyContent: 'center', alignItems: 'center',
                                 color: isPassed ? 'white' : 'var(--text-primary)',
                                 boxShadow: isActive ? '0 0 15px var(--color-warning)' : 'none'
                               }}
                               animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                               transition={{ repeat: Infinity, duration: 1 }}
                             >
                               {isPassed ? '✓' : idx + 1}
                             </motion.div>
                             <span style={{ fontWeight: isActive ? 'bold' : 'normal', color: isActive ? 'white' : 'var(--text-muted)' }}>{member}</span>
                          </div>
                        )
                     })}
                     <div className="flex-col flex-center gap-sm">
                         <div style={{ width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Crown size={32} color="var(--color-warning)"/></div>
                         <span className="text-muted">Đích</span>
                     </div>
                  </div>

                  {/* Thanh Track ngang */}
                  <div style={{ position: 'absolute', top: '50%', left: '40px', right: '40px', height: '8px', background: 'var(--bg-input)', zIndex: 1, borderRadius: '4px', transform: 'translateY(-25px)' }}>
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${team.progress}%` }}
                        style={{ height: '100%', background: 'var(--color-success)', borderRadius: '4px' }}
                        transition={{ duration: 0.5 }}
                     />
                  </div>
               </div>

            </div>
          ))}
       </div>
    </div>
  )
}
