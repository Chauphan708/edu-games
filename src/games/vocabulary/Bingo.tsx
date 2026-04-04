import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target } from 'lucide-react'

interface BingoProps {
  role: 'teacher' | 'student'
}

// BINGO = Ma trận n x n vuông. Giả lập 3x3
const BINGO_WORDS = [
  'Dog', 'Cat', 'Bird', 'Fish', 'Tiger', 'Lion', 'Bear', 'Wolf', 'Fox'
]

export default function Bingo({ role }: BingoProps) {
  // Lấy danh sách từ gọi của cả lớp (Realtime broadcast từ Teacher)
  const [calledWords, setCalledWords] = useState<string[]>(['Dog', 'Cat']) // Mẫu đã gọi 2 từ

  // --- STUDENT VIEW ---
  if (role === 'student') {
    // Generate card 1 lần khi vào game (Xáo trộn)
    const [myCard, setMyCard] = useState<string[]>([])
    const [marked, setMarked] = useState<number[]>([]) // Lưu index những ô đã đánh dấu

    useEffect(() => {
      setMyCard([...BINGO_WORDS].sort(() => Math.random() - 0.5))
    }, [])

    const handleMark = (index: number, word: string) => {
      // Chỉ cho click nếu từ đó đã được Teacher gọi
      if (!calledWords.includes(word)) {
         alert('Giáo viên chưa gọi từ này!')
         return
      }
      if (!marked.includes(index)) {
        setMarked([...marked, index])
      }
    }

    // Logic kiểm tra BINGO (3x3: 3 rows, 3 cols, 2 diags)
    const checkBingo = () => {
      const winLines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diagonals
      ]
      return winLines.some(line => line.every(idx => marked.includes(idx)))
    }

    const hasBingo = checkBingo()

    return (
      <div className="flex-col flex-center gap-xl" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
        <h3 className="text-center">Lắng nghe hoặc nhìn từ khóa giáo viên gọi!</h3>
        
        {/* Lịch sử từ đã gọi */}
        <div className="flex gap-sm" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
           {calledWords.map(w => (
             <span key={w} className="badge badge-quiz" style={{ fontSize: 'var(--text-sm)' }}>
                {w}
             </span>
           ))}
        </div>

        {/* Bingo Card (3x3 grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%', aspectRatio: '1/1' }}>
           {myCard.map((word, index) => {
              const isMarked = marked.includes(index)
              return (
                <motion.button 
                   key={index} 
                   className="btn"
                   style={{ 
                     height: '100%', 
                     display: 'flex', flexDirection: 'column', 
                     justifyContent: 'center', alignItems: 'center',
                     background: isMarked ? 'var(--color-primary)' : 'var(--bg-card)',
                     color: isMarked ? 'white' : 'var(--text-primary)',
                     border: '2px solid',
                     borderColor: isMarked ? 'var(--color-primary)' : 'var(--border-color)',
                     fontSize: 'var(--text-xl)', fontWeight: 700
                   }}
                   onClick={() => handleMark(index, word)}
                   whileTap={{ scale: 0.9 }}
                >
                   {isMarked ? <Target size={32}/> : word}
                </motion.button>
              )
           })}
        </div>

        {/* BINGO Button */}
        <motion.button 
           className="btn btn-lg"
           style={{ 
             width: '100%', height: '80px', fontSize: 'var(--text-2xl)', fontWeight: 900,
             background: hasBingo ? 'var(--color-danger)' : 'var(--bg-input)',
             color: hasBingo ? 'white' : 'var(--text-muted)',
             textShadow: hasBingo ? '0px 0px 10px rgba(255,255,255,0.5)' : 'none'
           }}
           animate={hasBingo ? { scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] } : {}}
           transition={{ repeat: Infinity, duration: 0.5 }}
           disabled={!hasBingo}
        >
           {hasBingo ? 'BINGO !!!' : 'Chưa xếp đủ hàng'}
        </motion.button>
      </div>
    )
  }

  // --- TEACHER VIEW ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%' }}>
       <h2 style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>Bingo Từ Vựng</h2>
       <p className="text-secondary" style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2xl)' }}>Gửi cho học sinh từng từ khóa một</p>
       
       <div className="card text-center" style={{ width: '500px' }}>
          <h4>Từ khóa hiện tại</h4>
          <h1 style={{ fontSize: '5rem', color: 'var(--color-primary-light)', margin: 'var(--space-md) 0' }}>Bird</h1>
          
          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-md)' }}>
            Gửi từ tiếp theo (Random)
          </button>
       </div>

       <div className="badge badge-success" style={{ marginTop: 'var(--space-2xl)', fontSize: 'var(--text-xl)', padding: '16px 24px' }}>
          Có 2 học sinh đang kẹt ở 1 ô cuối cùng! Tính cạnh tranh rất cao.
       </div>
    </div>
  )
}
