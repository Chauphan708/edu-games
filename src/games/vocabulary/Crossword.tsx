import { useState } from 'react'
import { motion } from 'framer-motion'
import { Grid3x3, CheckCircle2 } from 'lucide-react'

interface CrosswordProps {
  role: 'teacher' | 'student'
}

// Giả lập Dữ liệu Ô chữ (Crossword Clues)
const CROSSWORD_DATA = [
  { id: 1, type: 'across', question: 'Vương quốc sương mù là tên gọi khác của nước nào?', answer: 'ANH', length: 3 },
  { id: 2, type: 'down', question: 'Ngôn ngữ phổ biến nhất thế giới?', answer: 'TIENGANH', length: 8 },
  { id: 3, type: 'across', question: 'Thủ đô của nước Anh?', answer: 'LONDON', length: 6 },
]

export default function Crossword({ role }: CrosswordProps) {
  // --- STUDENT VIEW ---
  if (role === 'student') {
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    const handleInput = (id: number, val: string, correctLen: number) => {
       const upperText = val.toUpperCase().replace(/[^A-Z]/g, '').slice(0, correctLen)
       setAnswers({ ...answers, [id]: upperText })
    }

    const checkAll = () => {
       return CROSSWORD_DATA.every(item => answers[item.id] === item.answer)
    }

    const isWinner = checkAll()

    return (
      <div className="flex-col gap-xl" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
        <h3 className="text-center" style={{ marginBottom: 'var(--space-md)' }}>Giải ô chữ sau</h3>
        
        {/* Danh sách Clues (Mobile friendly list instead of tiny grid) */}
        <div className="flex-col gap-md">
           {CROSSWORD_DATA.map((item, index) => {
              const currentInput = answers[item.id] || ''
              const isFull = currentInput.length === item.length
              const isCorrect = currentInput === item.answer

              return (
                 <div key={item.id} className="card" style={{ background: 'var(--bg-surface)' }}>
                    <div className="flex flex-between" style={{ marginBottom: 'var(--space-md)' }}>
                       <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                          {item.type === 'across' ? 'Hàng ngang' : 'Hàng dọc'} {item.id}
                       </span>
                       <span className="badge badge-secondary">{item.length} chữ cái</span>
                    </div>

                    <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-md)' }}>{item.question}</p>
                    
                    {/* Visual Squares for Letters */}
                    <div className="flex gap-sm" style={{ marginBottom: isFull ? 'var(--space-md)' : 0 }}>
                       {Array.from({ length: item.length }).map((_, charIdx) => {
                          const char = currentInput[charIdx] || ''
                          return (
                            <div 
                               key={charIdx} 
                               className="flex-center"
                               style={{ 
                                 width: '32px', height: '32px', 
                                 border: '2px solid',
                                 borderColor: char ? (isCorrect ? 'var(--color-success)' : 'var(--color-primary)') : 'var(--border-color)',
                                 borderRadius: 'var(--radius-sm)',
                                 fontSize: 'var(--text-lg)', fontWeight: 700,
                                 background: char ? 'var(--bg-input)' : 'transparent'
                               }}
                            >
                               {char}
                            </div>
                          )
                       })}
                    </div>

                    {/* Input Field (ẩn đi nếu đã full và đúng) */}
                    {(!isFull || !isCorrect) && (
                      <input 
                         type="text"
                         className="input input-lg"
                         placeholder="Nhập đáp án (Viết liền không dấu)..."
                         value={currentInput}
                         style={{ marginTop: 'var(--space-md)', width: '100%', textTransform: 'uppercase' }}
                         onChange={(e) => handleInput(item.id, e.target.value, item.length)}
                      />
                    )}
                 </div>
              )
           })}
        </div>

        {isWinner && (
           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="card text-center" style={{ background: 'var(--color-success)', color: 'white', border: 'none' }}>
              <CheckCircle2 size={48} style={{ marginBottom: 'var(--space-sm)' }}/>
              <h2>Chúc mừng!</h2>
              <p>Bạn đã giải mã thành công toàn bộ ô chữ.</p>
           </motion.div>
        )}
      </div>
    )
  }

  // --- TEACHER VIEW ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%' }}>
       <h2 style={{ fontSize: '3rem', marginBottom: 'var(--space-2xl)' }}><Grid3x3 size={40} style={{ verticalAlign: 'middle', marginRight: '16px' }} /> Giải Ô Chữ</h2>
       
       <div className="card text-left" style={{ width: '600px' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Thống kê (Real-time)</h3>
          
          <div className="flex-col gap-md" style={{ marginTop: '16px' }}>
             {CROSSWORD_DATA.map(item => (
                <div key={item.id} className="flex flex-between items-center">
                   <div style={{ flex: 1 }}>
                     <strong style={{ color: 'var(--color-primary)' }}>{item.id} ({item.type})</strong> - {item.question}
                   </div>
                   <div className="flex-col items-end">
                      {/* Giả lập progress bar */}
                      <div style={{ color: 'var(--color-success)', fontWeight: 600 }}>15/25 giải được</div>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  )
}
