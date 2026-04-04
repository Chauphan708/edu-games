import { useState } from 'react'
import { motion } from 'framer-motion'
import { Layers } from 'lucide-react'
import type { GameComponentProps } from '../registry'
import './VocabularyGames.css'

// Giả lập Dữ liệu Cặp thẻ bài
const CARDS_DATA = [
  { id: 1, pairId: 'A', content: 'Cây táo', type: 'text' },
  { id: 2, pairId: 'A', content: 'Apple tree', type: 'text' },
  { id: 3, pairId: 'B', content: 'Con mèo', type: 'text' },
  { id: 4, pairId: 'B', content: 'Cat', type: 'text' },
  { id: 5, pairId: 'C', content: 'Ngôi nhà', type: 'text' },
  { id: 6, pairId: 'C', content: 'House', type: 'text' },
  { id: 7, pairId: 'D', content: 'Mặt trời', type: 'text' },
  { id: 8, pairId: 'D', content: 'Sun', type: 'text' },
]

export default function MemoryMatch({ role }: GameComponentProps) {
  // --- STUDENT VIEW ---
  if (role === 'student') {
    const [cards] = useState([...CARDS_DATA].sort(() => Math.random() - 0.5))
    const [flipped, setFlipped] = useState<number[]>([])
    const [matched, setMatched] = useState<string[]>([])

    const handleFlip = (index: number) => {
      if (flipped.includes(index) || flipped.length >= 2 || matched.includes(cards[index].pairId)) return

      const newFlipped = [...flipped, index]
      setFlipped(newFlipped)

      if (newFlipped.length === 2) {
        const [firstIdx, secondIdx] = newFlipped
        if (cards[firstIdx].pairId === cards[secondIdx].pairId) {
          setMatched([...matched, cards[firstIdx].pairId])
          setFlipped([])
        } else {
          setTimeout(() => setFlipped([]), 1000)
        }
      }
    }

    const isWinner = matched.length === CARDS_DATA.length / 2

    return (
      <div className="flex-col flex-center gap-md" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
         <div className="text-center" style={{ marginBottom: 'var(--space-md)' }}>
           <h3>Tìm các cặp từ vựng chính xác</h3>
           <p style={{ color: 'var(--text-secondary)' }}>Tiến độ: {matched.length} / {CARDS_DATA.length / 2} cặp</p>
         </div>

         <div className="grid grid-3 gap-md" style={{ width: '100%' }}>
            {cards.map((card, index) => {
               const isFlipped = flipped.includes(index) || matched.includes(card.pairId)
               return (
                 <div key={card.id} className="memory-card" onClick={() => handleFlip(index)}>
                   <motion.div 
                     className="memory-card-inner"
                     initial={false}
                     animate={{ rotateY: isFlipped ? 180 : 0 }}
                     transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
                   >
                     <div className="memory-card-back flex-center">
                       <Layers size={32} color="var(--color-primary)" opacity={0.5} />
                     </div>
                     <div className={`memory-card-front flex-center ${matched.includes(card.pairId) ? 'matched' : ''}`}>
                        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 600, textAlign: 'center', padding: '8px' }}>
                          {card.content}
                        </span>
                     </div>
                   </motion.div>
                 </div>
               )
            })}
         </div>

         {isWinner && (
           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="badge badge-success" style={{ marginTop: 'var(--space-xl)', fontSize: 'var(--text-xl)', padding: '16px 32px' }}>
             🎉 XUẤT SẮC! Hoàn thành!
           </motion.div>
         )}
      </div>
    )
  }

  // --- TEACHER VIEW ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%' }}>
       <h2 style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>Tìm các cặp từ vựng tương ứng</h2>
       <div className="grid grid-2 gap-xl" style={{ marginTop: 'var(--space-2xl)', width: '600px' }}>
          <div className="card text-center" style={{ borderColor: 'var(--color-success)' }}>
             <h3 style={{ fontSize: '3rem', color: 'var(--color-success)', margin: 0 }}>12</h3>
             <p>Học sinh đã hoàn thành</p>
          </div>
          <div className="card text-center" style={{ borderColor: 'var(--color-warning)' }}>
             <h3 style={{ fontSize: '3rem', color: 'var(--color-warning)', margin: 0 }}>8</h3>
             <p>Học sinh đang hì hục tìm thẻ</p>
          </div>
       </div>
    </div>
  )
}
