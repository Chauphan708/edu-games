import { useState } from 'react'
import { motion, Reorder } from 'framer-motion'
import { GripVertical, Target } from 'lucide-react'
import type { GameComponentProps } from '../registry'

// Cài đặt Reorder từ framer-motion cho mượt

const INITIAL_ITEMS = [
  { id: '1', text: 'Nhộng (Pupa)' },
  { id: '2', text: 'Bướm trưởng thành (Adult)' },
  { id: '3', text: 'Trứng (Egg)' },
  { id: '4', text: 'Sâu bướm (Caterpillar)' },
]

// Mảng đúng (Dùng để kiểm tra)
const CORRECT_ORDER = ['3', '4', '1', '2']

export default function SortOrder({ role }: SortOrderProps) {
  const [items, setItems] = useState(INITIAL_ITEMS)
  const [submitted, setSubmitted] = useState(false)

  const isCorrect = items.map(i => i.id).join(',') === CORRECT_ORDER.join(',')

  // --- STUDENT VIEW ---
  if (role === 'student') {
    return (
      <div className="flex-col gap-xl" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
        <div className="text-center">
           <h3 style={{ marginBottom: 'var(--space-sm)' }}>Sắp xếp Vòng đời của Bướm</h3>
           <p className="text-secondary">Chạm và kéo phần tử lên xuống để đổi chỗ</p>
        </div>

        {/* UI Kéo Thả Dọc (Vertical dnd) */}
        <Reorder.Group 
           axis="y" 
           values={items} 
           onReorder={setItems}
           className="flex-col gap-sm"
           style={{ margin: 0, padding: 0, listStyle: 'none' }}
        >
           {items.map((item) => (
             <Reorder.Item 
                key={item.id} 
                value={item} 
                className="card flex items-center"
                style={{
                  background: 'var(--bg-surface)', 
                  padding: 'var(--space-md) var(--space-xl)',
                  cursor: 'grab',
                  borderColor: submitted ? (items.map(i => i.id).join(',') === CORRECT_ORDER.join(',') ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--border-color)'
                }}
             >
                <GripVertical className="text-muted" style={{ marginRight: 'var(--space-md)' }} />
                <span style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{item.text}</span>
             </Reorder.Item>
           ))}
        </Reorder.Group>

        <button 
           className="btn btn-primary btn-lg mt-xl" 
           onClick={() => setSubmitted(true)}
           disabled={submitted}
        >
           <Target size={20} /> Kiểm tra thứ tự
        </button>

        {submitted && (
           <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center" style={{ fontSize: 'var(--text-xl)', color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 800 }}>
             {isCorrect ? 'CHÍNH XÁC! Quá đỉnh!' : 'Ồ không, sai rồi!'}
           </motion.div>
        )}
      </div>
    )
  }

  // --- TEACHER VIEW ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%' }}>
       <h2 style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>Sắp xếp vòng đời của Bướm</h2>
       
       <div className="card" style={{ width: '600px', marginTop: 'var(--space-2xl)' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Thống kê số lượng hoàn thành</h3>
          
          <div className="flex flex-between items-center" style={{ marginTop: 'var(--space-xl)' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 'var(--text-xl)', color: 'var(--color-success)', fontWeight: 800 }}>12 HS</div>
              <div className="text-muted">Đã xếp đúng hoàn toàn</div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 'var(--text-xl)', color: 'var(--color-danger)', fontWeight: 800 }}>5 HS</div>
              <div className="text-muted">Bị nhầm vị trí Sâu/Nhộng</div>
            </div>
            
             <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', fontWeight: 800 }}>8 HS</div>
              <div className="text-muted">Đang kéo & thả</div>
            </div>
          </div>
       </div>
    </div>
  )
}
