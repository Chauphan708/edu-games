import { useState } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'

interface WordScrambleProps {
  role: 'teacher' | 'student'
}

const SECRET_WORD = "BEAUTIFUL"
const SCRAMBLED = ["U", "A", "E", "B", "L", "T", "F", "I", "U"] // Xáo trộn

export default function WordScramble({ role }: WordScrambleProps) {
  // --- STUDENT VIEW ---
  if (role === 'student') {
    const [selectedLetters, setSelectedLetters] = useState<{char: string, origIndex: number}[]>([])
    const [availableIndexes, setAvailableIndexes] = useState<number[]>(SCRAMBLED.map((_, i) => i)) // Đảo lại trạng thái ban đầu

    const handleSelect = (char: string, index: number) => {
      setSelectedLetters([...selectedLetters, { char, origIndex: index }])
      setAvailableIndexes(availableIndexes.filter(i => i !== index))
    }

    const handleUndo = (indexInSelected: number) => {
       const removed = selectedLetters[indexInSelected]
       const newSelected = [...selectedLetters]
       newSelected.splice(indexInSelected, 1) // Rút ra
       
       setSelectedLetters(newSelected)
       setAvailableIndexes([...availableIndexes, removed.origIndex].sort((a,b) => a-b))
    }

    const currentWord = selectedLetters.map(l => l.char).join('')
    const isFull = selectedLetters.length === SCRAMBLED.length
    const isCorrect = currentWord === SECRET_WORD

    return (
      <div className="flex-col flex-center gap-xl" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
         <h3 style={{ color: 'var(--text-secondary)' }}>Nhấp vào chữ cái để giải mã từ: <br/>"Xinh đẹp"</h3>
         
         {/* Ô Kết Quả (Vùng Đích) */}
         <div className="flex flex-center" style={{ gap: '8px', flexWrap: 'wrap', minHeight: '60px', padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)', width: '100%' }}>
            {selectedLetters.map((item, idx) => (
               <motion.button 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  key={`sel-${idx}`}
                  className="btn btn-primary"
                  style={{ width: '48px', height: '48px', fontSize: 'var(--text-xl)', fontWeight: 800, padding: 0 }}
                  onClick={() => handleUndo(idx)}
               >
                 {item.char}
               </motion.button>
            ))}
            {/* Box mờ báo hiệu còn thiếu */}
            {Array.from({ length: SCRAMBLED.length - selectedLetters.length }).map((_, i) => (
                <div key={`empty-${i}`} style={{ width: '48px', height: '48px', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }} />
            ))}
         </div>

         {/* Nút Reset */}
         {selectedLetters.length > 0 && !isCorrect && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedLetters([]); setAvailableIndexes(SCRAMBLED.map((_, i) => i)) }}>
               <RotateCcw size={16}/> Chơi lại
            </button>
         )}

         {/* Thông báo xong */}
         {isFull && isCorrect && (
           <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center" style={{ color: 'var(--color-success)', fontSize: 'var(--text-xl)', fontWeight: 800 }}>
              Tuyệt vời! +20 điểm
           </motion.div>
         )}
         {isFull && !isCorrect && (
           <motion.div initial={{ x: -10 }} animate={{ x: [0, -10, 10, -10, 10, 0] }} className="text-center" style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
              Chưa đúng rồi. Nhấp vào chữ trên để bỏ chọn.
           </motion.div>
         )}

         {/* Chữ cái cho sẵn (Vùng Nguồn) */}
         <hr style={{ width: '100%', borderColor: 'var(--border-color)', margin: 'var(--space-md) 0' }}/>
         <div className="flex flex-center" style={{ gap: '12px', flexWrap: 'wrap' }}>
            {SCRAMBLED.map((char, index) => {
               const isUsed = !availableIndexes.includes(index)
               return (
                 <button 
                    key={`scramble-${index}`}
                    className="btn btn-secondary"
                    disabled={isUsed}
                    style={{ width: '54px', height: '54px', fontSize: 'var(--text-2xl)', fontWeight: 700, padding: 0, opacity: isUsed ? 0 : 1, transform: isUsed ? 'scale(0)' : 'scale(1)', transition: 'all 0.3s' }}
                    onClick={() => handleSelect(char, index)}
                 >
                   {char}
                 </button>
               )
            })}
         </div>
      </div>
    )
  }

  // --- TEACHER VIEW ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%' }}>
       <h2 style={{ fontSize: '3rem', marginBottom: 'var(--space-md)', letterSpacing: '8px' }}>B E A U T I F U L</h2>
       <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-primary-light)' }}>Nghĩa đen: "Xinh đẹp"</p>
       
       <div className="card" style={{ marginTop: 'var(--space-3xl)', minWidth: '400px' }}>
          <h3 style={{ margin: 0, paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--border-color)' }}>Tiến độ học sinh giải mã:</h3>
          <div className="flex-col gap-sm" style={{ marginTop: 'var(--space-md)', textAlign: 'left' }}>
             <div className="flex flex-between"><span>Đã giải mã thành công:</span> <strong className="text-success">22 HS</strong></div>
             <div className="flex flex-between"><span>Đang vướng ở "F I U L":</span> <strong className="text-warning">5 HS</strong></div>
          </div>
       </div>
    </div>
  )
}
