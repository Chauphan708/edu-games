import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import './VocabularyGames.css'

interface DragClassifyProps {
  role: 'teacher' | 'student'
}

// Giả lập Dữ liệu Phân loại
const MOCK_CATEGORIES = [
  { id: 'catA', title: 'Động vật ăn cỏ' },
  { id: 'catB', title: 'Động vật ăn thịt' },
]

const MOCK_ITEMS = [
  { id: 'i1', text: 'Hươu cao cổ', catId: 'catA' },
  { id: 'i2', text: 'Sư tử', catId: 'catB' },
  { id: 'i3', text: 'Con cừu', catId: 'catA' },
  { id: 'i4', text: 'Cá mập', catId: 'catB' },
  { id: 'i5', text: 'Ngựa vằn', catId: 'catA' },
  { id: 'i6', text: 'Sói', catId: 'catB' },
]

export default function DragClassify({ role }: DragClassifyProps) {
  // state: quản lý item nào đang nằm ở zone nào (mặc định 'pool' là chưa phân loại)
  const [itemLocations, setItemLocations] = useState<Record<string, string>>(
    () => MOCK_ITEMS.reduce((acc, curr) => ({ ...acc, [curr.id]: 'pool' }), {})
  )
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  
  // Tính tổng số lượng đã phân đúng/sai
  const isFinished = Object.values(itemLocations).every(loc => loc !== 'pool')
  const correctCount = MOCK_ITEMS.filter(it => itemLocations[it.id] === it.catId).length

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id)
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Required to allow drop
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetZone: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id && itemLocations[id] !== targetZone) {
      setItemLocations(prev => ({ ...prev, [id]: targetZone }))
    }
    setDraggedItemId(null)
  }

  // --- STUDENT VIEW ---
  if (role === 'student') {
    return (
      <div className="flex-col gap-xl" style={{ width: '100%', maxWidth: '800px' }}>
        <h3 className="text-center">Kéo thả các con vật vào đúng nhóm</h3>
        
        {/* Drop Zones */}
        <div className="grid grid-2 gap-md">
           {MOCK_CATEGORIES.map(cat => (
              <div 
                key={cat.id} 
                className="drop-zone"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, cat.id)}
              >
                <div className="drop-zone-title">{cat.title}</div>
                {MOCK_ITEMS.filter(item => itemLocations[item.id] === cat.id).map(item => (
                  <motion.div layoutId={item.id} key={item.id} className="draggable-item" style={{ background: 'var(--bg-surface)' }}>
                    {item.text}
                  </motion.div>
                ))}
              </div>
           ))}
        </div>

        {/* Word Pool (Nguồn) */}
        <div 
          className="card" style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', minHeight: '120px' }}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'pool')}
        >
          <div style={{ width: '100%', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: '8px' }}>Từ chưa phân loại:</div>
          {MOCK_ITEMS.filter(item => itemLocations[item.id] === 'pool').map(item => (
            <motion.div 
              layoutId={item.id}
              key={item.id} 
              className="draggable-item"
              draggable
              onDragStart={(e: any) => handleDragStart(e, item.id)}
              onDragEnd={() => setDraggedItemId(null)}
              style={{ opacity: draggedItemId === item.id ? 0.5 : 1 }}
            >
              {item.text}
            </motion.div>
          ))}
        </div>

        {/* Hoàn thành */}
        {isFinished && (
           <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card text-center" style={{ background: 'var(--bg-surface)', borderColor: 'var(--color-primary)' }}>
              Xong! Bạn phân loại đúng <strong style={{ color: 'var(--color-success)', fontSize: 'var(--text-xl)' }}>{correctCount}/{MOCK_ITEMS.length}</strong> từ.
              <br/>
              <button className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}><CheckCircle2 size={20}/> Gửi Kết Quả</button>
           </motion.div>
        )}
      </div>
    )
  }

  // --- TEACHER VIEW ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%' }}>
       <h2 style={{ fontSize: '3rem', marginBottom: 'var(--space-2xl)' }}>Phân loại: Động vật Ăn Cỏ & Ăn Thịt</h2>
       
       <div className="grid grid-2 gap-2xl text-center" style={{ width: '60%' }}>
          <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: 'var(--space-xl)' }}>
             <h3 style={{ color: 'var(--color-success)', fontSize: '3rem', margin: 0 }}>85%</h3>
             <p>thường phân đúng nhóm<br/><b>Con cừu</b></p>
          </div>
          <div style={{ paddingLeft: 'var(--space-xl)' }}>
             <h3 style={{ color: 'var(--color-danger)', fontSize: '3rem', margin: 0 }}>40%</h3>
             <p>thường thả nhầm nhóm<br/><b>Hươu cao cổ</b></p>
          </div>
       </div>

       <div className="badge badge-secondary" style={{ marginTop: 'var(--space-3xl)', fontSize: 'var(--text-xl)', padding: '16px 24px' }}>
          Đã có 18/25 HS hoàn thành bài phân loại
       </div>
    </div>
  )
}
