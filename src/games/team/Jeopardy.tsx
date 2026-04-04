import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, XCircle } from 'lucide-react'

interface JeopardyProps {
  role: 'teacher' | 'student'
}

type QuestionStatus = 'idle' | 'active' | 'answered'

interface JeopardyQuestion {
  id: string
  category: string
  points: number
  text: string
  status: QuestionStatus
}

// Lưới dữ liệu
const INITIAL_DATA: JeopardyQuestion[] = [
  { id: '1', category: 'Lịch Sử', points: 100, text: 'Vị vua cuối cùng của Việt Nam?', status: 'idle' },
  { id: '2', category: 'Lịch Sử', points: 200, text: 'Chiến dịch Điện Biên Phủ năm nào?', status: 'idle' },
  { id: '3', category: 'Lịch Sử', points: 300, text: 'Quốc hiệu Việt Nam có từ năm nào?', status: 'idle' },
  
  { id: '4', category: 'Địa Lý', points: 100, text: 'Đỉnh núi cao nhất Việt Nam?', status: 'idle' },
  { id: '5', category: 'Địa Lý', points: 200, text: 'Hang động lớn nhất thế giới nằm ở tỉnh nào?', status: 'idle' },
  { id: '6', category: 'Địa Lý', points: 300, text: 'Việt Nam có bao nhiêu tỉnh thành phố có biển?', status: 'answered' },
  
  { id: '7', category: 'Văn Học', points: 100, text: 'Tác giả Truyện Kiều?', status: 'idle' },
  { id: '8', category: 'Văn Học', points: 200, text: 'Tác phẩm "Chí Phèo" lúc đầu tên là gì?', status: 'idle' },
  { id: '9', category: 'Văn Học', points: 300, text: 'Ai được mệnh danh là Bà chúa thơ Nôm?', status: 'active' },
]

export default function Jeopardy({ role }: JeopardyProps) {
  const [questions, setQuestions] = useState(INITIAL_DATA)
  const activeQ = questions.find(q => q.status === 'active')

  // --- STUDENT VIEW ---
  if (role === 'student') {
    return (
      <div className="flex-col flex-center text-center gap-xl" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
        <h3 style={{ color: 'var(--text-secondary)' }}>Bảng Cược Mạng</h3>
        
        {activeQ ? (
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ width: '100%', borderColor: 'var(--color-warning)' }}>
              <div className="badge badge-warning" style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)' }}>
                {activeQ.category} - {activeQ.points} Điểm
              </div>
              <h2 style={{ fontSize: 'var(--text-2xl)', marginTop: 0 }}>{activeQ.text}</h2>
              
              <div className="flex-col gap-sm" style={{ marginTop: 'var(--space-xl)' }}>
                <input type="text" className="input input-lg" placeholder="Nhập đáp án..." autoFocus />
                <button className="btn btn-primary btn-lg"><Coins size={20}/> Nộp & Cược Điểm Tương Ứng</button>
              </div>
           </motion.div>
        ) : (
           <div className="card text-center" style={{ width: '100%', padding: 'var(--space-2xl)' }}>
              <p style={{ fontSize: 'var(--text-xl)' }}>Chờ đội bạn (hoặc giáo viên) chọn câu hỏi trên bảng lớn...</p>
           </div>
        )}
      </div>
    )
  }

  // --- TEACHER VIEW (PROJECTOR) ---
  const handleTileClick = (id: string) => {
    setQuestions(questions.map(q => {
       if (q.id === id) return { ...q, status: 'active' }
       if (q.status === 'active') return { ...q, status: 'answered' } // Đóng câu cũ
       return q
    }))
  }

  const categories = Array.from(new Set(questions.map(q => q.category)))

  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%', height: '100%', position: 'relative' }}>
       
       <AnimatePresence>
         {activeQ && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
             style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,15,25,0.95)', zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
           >
              <h2 style={{ color: 'var(--color-warning)', fontSize: '4rem', margin: 0 }}>{activeQ.points} ĐIỂM</h2>
              <h1 style={{ fontSize: '5rem', margin: 'var(--space-2xl) 0', maxWidth: '1200px', padding: '0 40px' }}>{activeQ.text}</h1>
              
              <div className="flex gap-xl" style={{ marginTop: 'var(--space-3xl)' }}>
                 <button className="btn btn-secondary btn-lg" onClick={() => handleTileClick(activeQ.id)}>
                   <XCircle size={24}/> Đóng Lại
                 </button>
              </div>
           </motion.div>
         )}
       </AnimatePresence>

       <h2 style={{ fontSize: '3.5rem', marginBottom: 'var(--space-2xl)' }}>Cược Điểm Giành Quyền</h2>
       
       {/* Jeopardy Grid Board */}
       <div style={{ display: 'grid', gridTemplateColumns: `repeat(${categories.length}, 1fr)`, gap: '16px', width: '1000px' }}>
          
          {/* Headers */}
          {categories.map(cat => (
             <div key={cat} className="card" style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
               <h3 style={{ margin: 0, fontSize: '1.8rem' }}>{cat}</h3>
             </div>
          ))}

          {/* Tiles */}
          {categories.map(cat => (
             <div key={`col-${cat}`} className="flex-col gap-md">
                {questions.filter(q => q.category === cat).sort((a,b)=>a.points - b.points).map(q => (
                   <motion.button
                      key={q.id}
                      className="btn"
                      style={{ 
                        width: '100%', height: '100px', fontSize: '3rem', fontWeight: 900,
                        background: q.status === 'answered' ? 'transparent' : 'var(--bg-surface)',
                        color: q.status === 'answered' ? 'var(--bg-input)' : 'var(--color-warning)',
                        border: '2px solid',
                        borderColor: q.status === 'answered' ? 'var(--border-color)' : 'var(--color-warning-light)',
                        cursor: q.status === 'answered' ? 'default' : 'pointer'
                      }}
                      onClick={() => { if(q.status === 'idle') handleTileClick(q.id) }}
                      whileHover={q.status === 'idle' ? { scale: 1.05 } : {}}
                      whileTap={q.status === 'idle' ? { scale: 0.95 } : {}}
                   >
                     {q.status === 'answered' ? '' : q.points}
                   </motion.button>
                ))}
             </div>
          ))}
       </div>
    </div>
  )
}
