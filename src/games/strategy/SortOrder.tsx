import { useState } from 'react'
import { Reorder } from 'framer-motion'
import { ArrowDownUp, CheckCircle } from 'lucide-react'
import type { GameComponentProps } from '../registry'

export default function SortOrder({ role }: GameComponentProps) {
  const [items, setItems] = useState([
     { id: '1', content: 'Nhận diện vấn đề' },
     { id: '2', content: 'Tìm kiếm thông tin' },
     { id: '3', content: 'Đưa ra giải pháp' },
     { id: '4', content: 'Kiểm tra kết quả' },
  ])

  return (
    <div className="flex-col flex-center text-center p-xl">
      <div className="game-card card bg-dark p-xl" style={{ width: '100%', maxWidth: '600px' }}>
         <h2 className="mb-md">Sắp Xếp Thứ Tự</h2>
         <p className="mb-xl">Sắp xếp các bước dưới đây theo trình tự logic nhất!</p>

         <Reorder.Group axis="y" values={items} onReorder={setItems} className="flex-col gap-sm">
            {items.map((item) => (
               <Reorder.Item key={item.id} value={item} className="p-md bg-surface flex flex-between items-center" style={{ borderRadius: 'var(--radius-md)', cursor: 'grab' }}>
                  <span>{item.content}</span>
                  <ArrowDownUp size={18} opacity={0.5} />
               </Reorder.Item>
            ))}
         </Reorder.Group>

         {role === 'teacher' && (
           <p className="mt-xl" style={{ color: 'var(--color-success)' }}>
             Chế độ giáo viên: Giám sát quá trình sắp xếp của học sinh
           </p>
         )}
      </div>

      <button className="btn btn-primary mt-xl" onClick={() => {}}>
         <CheckCircle size={20} /> Xác nhận thứ tự
      </button>
    </div>
  )
}
