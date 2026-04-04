import { useState } from 'react'
import { motion } from 'framer-motion'
import { Hash, Sparkles } from 'lucide-react'
import type { GameComponentProps } from '../registry'

export default function Bingo({ role }: GameComponentProps) {
  const [calledWords] = useState<string[]>(['Apple', 'Banana', 'Orange'])

  return (
    <div className="flex-col flex-center text-center p-xl">
      <div className="game-card card bg-dark p-xl" style={{ width: '100%', maxWidth: '600px' }}>
         <h2 className="mb-md">Bingo Tri Thức</h2>
         <p className="mb-xl">Đánh dấu các từ vựng bạn nghe được, ai 5 hàng trước sẽ thắng!</p>

         <div className="bingo-grid grid grid-5 gap-sm" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            {Array.from({ length: 25 }).map((_, i) => (
               <div key={i} className="flex-center" style={{ 
                  aspectRatio: '1/1', background: calledWords.includes(i.toString()) ? 'var(--color-primary)' : 'var(--bg-surface)', 
                  border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' 
               }}>
                  {i === 12 ? 'FREE' : i + 1}
               </div>
            ))}
         </div>

         <div className="mt-xl card p-md bg-surface">
            <h4 className="flex items-center gap-sm justify-center"><Hash size={18} /> Từ đã gọi:</h4>
            <div className="flex flex-wrap gap-xs justify-center mt-sm">
               {calledWords.map(word => (
                  <span key={word} className="badge badge-secondary">{word}</span>
               ))}
            </div>
         </div>

         {role === 'teacher' && (
           <p className="mt-xl" style={{ color: 'var(--color-success)' }}>
             Chế độ giáo viên: Bốc thăm ngẫu nhiên từ vựng cho cả lớp
           </p>
         )}
      </div>

      <button className="btn btn-primary btn-lg mt-xl" onClick={() => {}}>
         <Sparkles size={20} /> BINGO!
      </button>
    </div>
  )
}
