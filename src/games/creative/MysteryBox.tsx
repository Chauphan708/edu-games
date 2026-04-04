import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Skull, Coins, Sparkles } from 'lucide-react'

interface MysteryBoxProps {
  role: 'teacher' | 'student'
}

type BoxState = 'closed' | 'open'

interface BoxData {
  id: number
  state: BoxState
  prizeType: 'good' | 'bad' | 'epic'
  prizeText: string
}

export default function MysteryBox({ role }: MysteryBoxProps) {
  // Thực tế sẽ dồng bộ trạng thái 3 hộp rỗng/chưa mở từ database
  const [boxes, setBoxes] = useState<BoxData[]>([
    { id: 1, state: 'closed', prizeType: 'good', prizeText: '+50 Điểm' },
    { id: 2, state: 'closed', prizeType: 'bad', prizeText: 'BOM! Trừ 20 Điểm' },
    { id: 3, state: 'closed', prizeType: 'epic', prizeText: 'JACKPOT: x3 Điểm' }
  ])

  // --- STUDENT VIEW ---
  if (role === 'student') {
    return (
      <div className="flex-col flex-center gap-xl text-center" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
         <h3 style={{ fontSize: 'var(--text-3xl)' }}>Bạn chọn Hộp số mấy?</h3>
         <p className="text-secondary">Hãy bàn bạc kỹ với Đội của mình nhé!</p>

         <div className="flex-col gap-md" style={{ width: '100%', marginTop: 'var(--space-2xl)' }}>
            {[1, 2, 3].map(num => (
              <button key={num} className="btn btn-secondary btn-lg" style={{ height: '80px', fontSize: 'var(--text-2xl)' }}>
                 Hộp Rương Báu vật {num}
              </button>
            ))}
         </div>
      </div>
    )
  }

  // --- TEACHER VIEW (PROJECTOR) ---
  const handleOpenBox = (id: number) => {
     setBoxes(boxes.map(b => b.id === id ? { ...b, state: 'open' } : b))
  }

  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%', height: '100%' }}>
       <h2 style={{ fontSize: '4rem', marginBottom: 'var(--space-3xl)' }}>Hộp Quà Bí Ẩn</h2>
       
       <div className="flex gap-2xl justify-center">
          {boxes.map((box) => (
             <motion.div 
               key={box.id}
               className="card flex-col flex-center"
               style={{ 
                 width: '250px', height: '350px', 
                 background: box.state === 'closed' ? 'var(--color-primary)' : 'var(--bg-surface)',
                 cursor: box.state === 'closed' ? 'pointer' : 'default',
                 borderColor: box.state === 'open' ? (box.prizeType === 'bad' ? 'var(--color-danger)' : 'var(--color-success)') : 'none',
                 borderWidth: '4px',
                 boxShadow: box.state === 'closed' ? '0 10px 30px rgba(108, 99, 255, 0.5)' : 'none'
               }}
               whileHover={box.state === 'closed' ? { scale: 1.05, y: -10 } : {}}
               onClick={() => handleOpenBox(box.id)}
             >
                <AnimatePresence mode="wait">
                   {box.state === 'closed' ? (
                     <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0 }} className="flex-col flex-center gap-sm" style={{ color: 'white' }}>
                        <Package size={100} />
                        <h3 style={{ fontSize: '2.5rem', margin: 0 }}>Rương {box.id}</h3>
                     </motion.div>
                   ) : (
                     <motion.div key="open" initial={{ opacity: 0, scale: 0.5, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="flex-col flex-center text-center">
                        {box.prizeType === 'bad' && <Skull size={80} color="var(--color-danger)" className="animate-shake" />}
                        {box.prizeType === 'good' && <Coins size={80} color="var(--color-warning)" />}
                        {box.prizeType === 'epic' && <Sparkles size={80} color="var(--color-success)" className="animate-bounce" />}
                        
                        <h3 style={{ 
                          fontSize: '2rem', marginTop: 'var(--space-xl)',
                          color: box.prizeType === 'bad' ? 'var(--color-danger)' : box.prizeType === 'epic' ? 'var(--color-success)' : 'var(--color-warning)'
                        }}>
                          {box.prizeText}
                        </h3>
                     </motion.div>
                   )}
                </AnimatePresence>
             </motion.div>
          ))}
       </div>

       <div className="text-muted" style={{ marginTop: 'var(--space-3xl)' }}>
         (Giáo viên nhấp vào hộp để mở theo lựa chọn của Đội)
       </div>
    </div>
  )
}
