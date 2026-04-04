import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Trophy, Users } from 'lucide-react'

interface QuizRaceProps {
  role: 'teacher' | 'student'
}

export default function QuizRace({ role }: QuizRaceProps) {
  // --- MOCK REALTIME STATE ---
  // Ở bản thực tế, biến này lấy từ supabase broadcast 'buzzer_pressed'
  const [buzzedBy, setBuzzedBy] = useState<{ id: string, name: string } | null>(null)
  const isLocked = buzzedBy !== null

  // --- STUDENT VIEW ---
  if (role === 'student') {
    const handleBuzzer = () => {
      if (isLocked) return
      // Gửi event qua Supabase
      setBuzzedBy({ id: 'me', name: 'Nguyễn Văn A (Bạn)' })
    }

    return (
      <div className="flex-col flex-center text-center gap-xl" style={{ width: '100%', height: '100%', padding: 'var(--space-xl)' }}>
         <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-secondary)' }}>Câu hỏi từ Giáo viên...</h3>
         
         {/* Nút bấm Chuông - Siêu to */}
         <motion.button 
           className="btn"
           style={{ 
             width: '250px', 
             height: '250px', 
             borderRadius: '50%', 
             background: buzzedBy?.id === 'me' ? 'var(--color-success)' : isLocked ? 'var(--bg-input)' : 'var(--color-danger)',
             border: `10px solid ${buzzedBy?.id === 'me' ? 'var(--color-success-light)' : isLocked ? 'var(--border-color)' : 'var(--color-danger-light)'}`,
             display: 'flex',
             flexDirection: 'column',
             alignItems: 'center',
             justifyContent: 'center',
             gap: 'var(--space-sm)',
             transformOrigin: 'center',
             boxShadow: isLocked ? 'none' : '0 20px 50px rgba(239, 71, 111, 0.4)',
             transition: 'background 0.3s'
           }}
           whileTap={!isLocked ? { scale: 0.9, y: 10 } : {}}
           onClick={handleBuzzer}
           disabled={isLocked}
         >
            <Bell size={80} color={isLocked ? 'var(--text-muted)' : 'white'} fill={isLocked ? 'none' : 'currentColor'} />
            <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, color: isLocked ? 'var(--text-muted)' : 'white' }}>
              {isLocked ? 'ĐÃ KHÓA' : 'GIÀNH QUYỀN'}
            </span>
         </motion.button>

         {/* Thông báo ai đã giành quyền */}
         {isLocked && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card" style={{ background: 'var(--color-primary-glow)', borderColor: 'var(--color-primary)' }}>
               <p style={{ margin: 0, fontSize: 'var(--text-lg)' }}>
                 🎉 <strong>{buzzedBy.name}</strong> đã giành quyền trả lời!
               </p>
            </motion.div>
         )}
      </div>
    )
  }

  // --- TEACHER VIEW ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%' }}>
       <div className="badge badge-team" style={{ marginBottom: 'var(--space-2xl)', padding: '16px 32px', fontSize: 'var(--text-2xl)' }}>
          <Bell size={32} /> CHUẨN BỊ BẤM CHUÔNG!
       </div>

       <h2 style={{ fontSize: '4rem', marginBottom: 'var(--space-3xl)', maxWidth: '1000px' }}>
          Đâu là quốc gia có diện tích lớn nhất thế giới?
       </h2>
       
       {!isLocked ? (
         <div className="animate-pulse" style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-primary-light)' }}>
            Chờ học sinh giành quyền...
         </div>
       ) : (
         <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card flex-col flex-center" style={{ background: 'var(--color-success)', color: 'white', border: 'none', padding: 'var(--space-3xl)' }}>
            <Trophy size={64} style={{ marginBottom: 'var(--space-md)' }} />
            <h3 style={{ fontSize: '3rem', margin: 0 }}>Nguyễn Văn A</h3>
            <p style={{ fontSize: 'var(--text-2xl)', opacity: 0.9, marginTop: 'var(--space-sm)' }}>Đã giành được quyền trả lời!</p>
            
            <button className="btn btn-secondary btn-lg" style={{ marginTop: 'var(--space-xl)', color: 'var(--text-primary)' }}>
               Xác nhận đúng (+10 điểm)
            </button>
         </motion.div>
       )}
    </div>
  )
}
