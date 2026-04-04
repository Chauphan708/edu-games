import { useState } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, HelpCircle } from 'lucide-react'

interface RevealPuzzleProps {
  role: 'teacher' | 'student'
}

// Lưới 3x3 (9 mảnh)
const PUZZLE_SIZE = 3
const TOTAL_PIECES = PUZZLE_SIZE * PUZZLE_SIZE

export default function RevealPuzzle({ role }: RevealPuzzleProps) {
  // Thực tế: Ảnh được cấu hình bởi giáo viên, lưu URL trong DB
  const MOCK_IMAGE_URL = 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' // Ảnh Sư tử
  
  const [uncovered, setUncovered] = useState<number[]>([])

  const handleReveal = (index: number) => {
    if (!uncovered.includes(index)) {
       setUncovered([...uncovered, index])
    }
  }

  // --- STUDENT VIEW ---
  if (role === 'student') {
    return (
      <div className="flex-col flex-center gap-xl" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
         <h3 style={{ fontSize: 'var(--text-2xl)' }}>Đoán Xem Đây Là Gì?</h3>
         <p className="text-secondary">Ai có đáp án hãy dơ tay ngay lập tức!</p>

         <div className="card" style={{ marginTop: 'var(--space-2xl)', background: 'var(--bg-surface)' }}>
            <h4 style={{ color: 'var(--color-primary-light)' }}>Câu hỏi đang mở:</h4>
            <p style={{ fontSize: 'var(--text-xl)', marginTop: 'var(--space-sm)' }}>Thành phố nào được mệnh danh là Hòn ngọc Viễn Đông?</p>
            <div className="flex-col gap-sm" style={{ marginTop: 'var(--space-md)' }}>
               {['Sài Gòn', 'Đà Lạt', 'Hà Nội'].map(opt => (
                 <button key={opt} className="btn btn-secondary btn-lg">{opt}</button>
               ))}
            </div>
         </div>
         <p className="text-muted"><small>(Trả lời đúng để mở mảnh ghép trên bảng)</small></p>
      </div>
    )
  }

  // --- TEACHER VIEW (PROJECTOR) ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%', height: '100%' }}>
       <h2 style={{ fontSize: '3rem', marginBottom: 'var(--space-2xl)' }}>Lật Mở Mảnh Ghép</h2>
       
       <div 
         style={{ 
           width: '600px', height: '600px', 
           position: 'relative', 
           borderRadius: 'var(--radius-xl)', 
           overflow: 'hidden',
           border: '8px solid white',
           boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
         }}
       >
          {/* Lớp nền Ảnh gốc */}
          <img 
            src={MOCK_IMAGE_URL} 
            alt="Secret" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
          />

          {/* Lớp lưới che phủ */}
          <div style={{ 
            width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, 
            display: 'grid', gridTemplateColumns: `repeat(${PUZZLE_SIZE}, 1fr)`, gridTemplateRows: `repeat(${PUZZLE_SIZE}, 1fr)`
          }}>
             {Array.from({ length: TOTAL_PIECES }).map((_, idx) => {
               const isRevealed = uncovered.includes(idx)
               return (
                 <motion.div
                   key={idx}
                   style={{
                     background: 'var(--color-primary)', 
                     border: '1px solid rgba(255,255,255,0.2)',
                     display: 'flex', justifyContent: 'center', alignItems: 'center',
                     cursor: 'pointer'
                   }}
                   initial={{ opacity: 1 }}
                   animate={{ opacity: isRevealed ? 0 : 1, scale: isRevealed ? 0.8 : 1 }}
                   transition={{ duration: 0.5 }}
                   onClick={() => handleReveal(idx)}
                 >
                   {!isRevealed && <span style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>{idx + 1}</span>}
                 </motion.div>
               )
             })}
          </div>
       </div>

       <div className="flex gap-md" style={{ marginTop: 'var(--space-3xl)' }}>
          <button className="btn btn-primary" onClick={() => setUncovered(Array.from({length: TOTAL_PIECES}).map((_,i)=>i))}>
             <ImageIcon size={20}/> Hiển thị toàn bộ
          </button>
          <button className="btn btn-secondary">
             <HelpCircle size={20}/> Gợi ý Tên
          </button>
       </div>
    </div>
  )
}
