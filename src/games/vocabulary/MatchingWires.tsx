import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlugZap } from 'lucide-react'

interface MatchingWiresProps {
  role: 'teacher' | 'student'
}

const LEFT_ITEMS = [
  { id: 'L1', content: 'Hello' },
  { id: 'L2', content: 'Thank you' },
  { id: 'L3', content: 'Goodbye' },
]

const RIGHT_ITEMS = [
  { id: 'R1', content: 'Tạm biệt' },
  { id: 'R2', content: 'Xin chào' },
  { id: 'R3', content: 'Cảm ơn' },
]

const CORRECT_PAIRS: Record<string, string> = {
  'L1': 'R2',
  'L2': 'R3',
  'L3': 'R1'
}

export default function MatchingWires({ role }: MatchingWiresProps) {
  // --- STUDENT VIEW ---
  if (role === 'student') {
    const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
    const [connections, setConnections] = useState<Record<string, string>>({}) // { L_id: R_id }
    
    // Lưu tọa độ tâm của các nút để vẽ SVG Line
    const containerRef = useRef<HTMLDivElement>(null)
    const [lineCoords, setLineCoords] = useState<{ x1: number, y1: number, x2: number, y2: number, isCorrect: boolean }[]>([])

    // Hàm tiện ích lấy tâm element
    const getCenter = (el: HTMLElement, containerRect: DOMRect) => {
      const rect = el.getBoundingClientRect()
      return {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top
      }
    }

    // Tính toán lại vị trí các đường nối mỗi khi connections thay đổi
    useEffect(() => {
      if (!containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      
      const newCoords = Object.entries(connections).map(([leftId, rightId]) => {
         const lNode = document.getElementById(`wire-${leftId}`)
         const rNode = document.getElementById(`wire-${rightId}`)
         if (!lNode || !rNode) return null
         
         const start = getCenter(lNode, containerRect)
         const end = getCenter(rNode, containerRect)
         const isCorrect = CORRECT_PAIRS[leftId] === rightId

         return { x1: start.x, y1: start.y, x2: end.x, y2: end.y, isCorrect }
      }).filter(Boolean) as any[]

      setLineCoords(newCoords)
    }, [connections])

    const handleLeftClick = (id: string) => {
      // Nếu đã nối rồi thì cho phép gỡ ra
      if (connections[id]) {
        const newConn = { ...connections }
        delete newConn[id]
        setConnections(newConn)
        setSelectedLeft(null)
      } else {
        setSelectedLeft(selectedLeft === id ? null : id)
      }
    }

    const handleRightClick = (id: string) => {
      if (!selectedLeft) return
      
      // Tìm xem rightId này có đang bị nối bởi ai khác không
      const alreadyConnectedLeft = Object.keys(connections).find(k => connections[k] === id)
      
      const newConn = { ...connections }
      if (alreadyConnectedLeft) delete newConn[alreadyConnectedLeft] // Gỡ dây thằng cũ ra
      
      newConn[selectedLeft] = id // Nối mới
      setConnections(newConn)
      setSelectedLeft(null) // Reset lựa chọn
    }

    const allConnected = Object.keys(connections).length === LEFT_ITEMS.length

    return (
      <div className="flex-col gap-xl" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        <h3 className="text-center">Nối từ Tiếng Anh với nghĩa Tiếng Việt</h3>
        
        {/* Container phải có relative để SVG định vị tuyệt đối */}
        <div ref={containerRef} style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2xl)' }}>
           
           {/* Lớp SVG vẽ dây */}
           <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
             {lineCoords.map((line, i) => (
                <motion.line 
                  key={i}
                  initial={{ strokeDasharray: 500, strokeDashoffset: 500 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} 
                  stroke={allConnected ? (line.isCorrect ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--color-primary)'} 
                  strokeWidth="4" 
                  strokeLinecap="round"
                />
             ))}
           </svg>

           {/* Cột Trái */}
           <div className="flex-col gap-xl" style={{ zIndex: 1 }}>
              {LEFT_ITEMS.map(item => {
                 const isConnected = !!connections[item.id]
                 const isSelected = selectedLeft === item.id
                 return (
                   <button 
                     id={`wire-${item.id}`} key={item.id}
                     className={`btn btn-lg ${isSelected ? 'btn-primary' : isConnected ? 'btn-secondary' : 'btn-ghost'}`}
                     style={{ border: isConnected ? '' : '2px solid var(--border-color)', width: '200px' }}
                     onClick={() => handleLeftClick(item.id)}
                   >
                     {item.content}
                   </button>
                 )
              })}
           </div>

           {/* Ổ điện ở giữa cho đẹp */}
           <div className="flex-col flex-center gap-xl" style={{ opacity: 0.2 }}>
              <PlugZap size={32}/><PlugZap size={32}/><PlugZap size={32}/>
           </div>

           {/* Cột Phải */}
           <div className="flex-col gap-xl" style={{ zIndex: 1 }}>
              {RIGHT_ITEMS.map(item => {
                 const isConnected = Object.values(connections).includes(item.id)
                 return (
                   <button 
                     id={`wire-${item.id}`} key={item.id}
                     className={`btn btn-lg ${isConnected ? 'btn-secondary' : 'btn-ghost'}`}
                     style={{ border: isConnected ? '' : '2px solid var(--border-color)', width: '200px' }}
                     onClick={() => handleRightClick(item.id)}
                     disabled={!selectedLeft && !isConnected}
                   >
                     {item.content}
                   </button>
                 )
              })}
           </div>
        </div>
      </div>
    )
  }

  // --- TEACHER VIEW ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%' }}>
       <h2 style={{ fontSize: '3rem', marginBottom: 'var(--space-2xl)' }}>Nối từ Tiếng Anh với nghĩa T.Việt</h2>
       
       <div className="card text-left" style={{ minWidth: '400px' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Thống kê hiện tại</h3>
          <ul style={{ padding: 0, listStyle: 'none', fontSize: 'var(--text-lg)', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
             <li className="flex flex-between">
                <span>Hello <span className="text-muted">→ Xin chào</span></span>
                <span className="badge badge-success">80% nối đúng</span>
             </li>
             <li className="flex flex-between">
                <span>Thank you <span className="text-muted">→ Cảm ơn</span></span>
                <span className="badge badge-success">75% nối đúng</span>
             </li>
             <li className="flex flex-between">
                <span>Goodbye <span className="text-muted">→ Tạm biệt</span></span>
                <span className="badge badge-danger">chỉ 10% nối đúng</span>
             </li>
          </ul>
       </div>
    </div>
  )
}
