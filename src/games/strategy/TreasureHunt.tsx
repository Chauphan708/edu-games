import { useState } from 'react'
import { motion } from 'framer-motion'
import { Diamond, Bomb, Pickaxe, Map } from 'lucide-react'

interface TreasureHuntProps {
  role: 'teacher' | 'student'
}

// 5x5 Cột (A-E) và Dòng (1-5)
const GRID_SIZE = 5

// Trạng thái ô (0: Ẩn, 1: Kho báu, -1: Bẫy/Bom, 2: Rỗng) -> Thực tế dữ liệu này nằm ẩn trên DB, GV mới xem được lưới thật
export default function TreasureHunt({ role }: TreasureHuntProps) {
  // --- MOCK REALTIME STATE ---
  const [shovels, setShovels] = useState(1) // Số lượt đào (Kiếm được bằng cách trả lời đúng câu hỏi phụ)
  const [revealed, setRevealed] = useState<string[]>([]) // Danh sách ô đã đào ('A1', 'B2',...)

  const cols = ['A', 'B', 'C', 'D', 'E']
  
  // Hàm giả lập kết quả đào
  const handleDig = (cellId: string) => {
    if (shovels <= 0 || revealed.includes(cellId)) return
    setRevealed([...revealed, cellId])
    setShovels(shovels - 1)
  }

  // --- STUDENT VIEW ---
  if (role === 'student') {
    return (
      <div className="flex-col flex-center gap-md" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
         <div className="flex flex-between items-center" style={{ width: '100%', marginBottom: 'var(--space-md)' }}>
            <h3>Bản Đồ Của Bạn</h3>
            <div className="badge badge-warning" style={{ fontSize: 'var(--text-lg)', padding: '8px 16px' }}>
               <Pickaxe size={20} style={{ marginRight: '8px' }}/> Xẻng: {shovels}
            </div>
         </div>

         {/* 5x5 Grid */}
         <div className="card" style={{ width: '100%', padding: 'var(--space-md)', background: 'var(--bg-surface)' }}>
           <div style={{ display: 'grid', gridTemplateColumns: `auto repeat(${GRID_SIZE}, 1fr)`, gap: '4px' }}>
              
              {/* Header Cột */}
              <div></div> 
              {cols.map(c => <div key={c} className="text-center text-muted" style={{ fontWeight: 600 }}>{c}</div>)}

              {/* Rows */}
              {Array.from({ length: GRID_SIZE }).map((_, rowIndex) => (
                <>
                  <div key={`row-${rowIndex}`} className="flex-center text-muted" style={{ fontWeight: 600 }}>{rowIndex + 1}</div>
                  {cols.map(col => {
                    const cellId = `${col}${rowIndex + 1}`
                    const isRevealed = revealed.includes(cellId)
                    return (
                      <motion.button
                        key={cellId}
                        className="btn"
                        style={{ 
                          aspectRatio: '1/1', padding: 0, 
                          background: isRevealed ? 'var(--bg-card)' : 'var(--color-primary-light)',
                          border: isRevealed ? '1px solid var(--border-color)' : 'none',
                          color: isRevealed ? 'var(--text-primary)' : 'white'
                        }}
                        whileTap={!isRevealed && shovels > 0 ? { scale: 0.8 } : {}}
                        onClick={() => handleDig(cellId)}
                        disabled={isRevealed || shovels === 0}
                      >
                         {isRevealed ? <strong style={{ color: 'var(--text-muted)' }}>ĐÃ ĐÀO</strong> : <Map size={24} opacity={0.5}/>}
                      </motion.button>
                    )
                  })}
                </>
              ))}
           </div>
         </div>

         {shovels === 0 && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card text-center" style={{ width: '100%' }}>
               <p style={{ margin: 0 }}>Bạn đã hết Xẻng! Chờ giáo viên phát câu hỏi mới để farm Xẻng nhé.</p>
            </motion.div>
         )}
      </div>
    )
  }

  // --- TEACHER VIEW (PROJECTOR) ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%', height: '100%' }}>
       <h2 style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>Bản Đồ Kho Báu (Lớp Trình Chiếu)</h2>
       <p className="text-secondary" style={{ marginBottom: 'var(--space-xl)' }}>Học sinh đang đào ở phía dưới...</p>
       
       <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gap: '8px', width: '600px', height: '600px', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
             const col = cols[index % GRID_SIZE]
             const row = Math.floor(index / GRID_SIZE) + 1
             const cellId = `${col}${row}`
             
             // Giả lập nội dung: Ô C3 có Mìn, B2 có Kim Cương
             const isRevealed = revealed.includes(cellId)
             let content = null
             let bgClass = 'var(--bg-card)'

             if (isRevealed) {
                if (cellId === 'C3') { content = <Bomb size={48} color="white"/>; bgClass = 'var(--color-danger)' }
                else if (cellId === 'B2') { content = <Diamond size={48} color="white"/>; bgClass = 'var(--color-success)' }
                else { content = <span style={{ fontSize: '24px', color: 'var(--text-muted)' }}>Trống</span>; bgClass = 'var(--bg-card)' }
             }

             return (
                <div key={cellId} className="flex-center" style={{ background: isRevealed ? bgClass : '#1E1E2F', borderRadius: '8px', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
                   {!isRevealed && <div style={{ position: 'absolute', top: 4, left: 8, fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{cellId}</div>}
                   {content}
                   
                   {/* Dấu vết học sinh đang đào */}
                   {isRevealed && cellId === 'B2' && (
                     <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, y: -20, opacity: 1 }} style={{ position: 'absolute', top: '-10px', background: 'var(--color-primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                       An đã tìm thấy!
                     </motion.div>
                   )}
                </div>
             )
          })}
       </div>
    </div>
  )
}
