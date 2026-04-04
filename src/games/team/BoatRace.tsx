import { useState } from 'react'
import { motion } from 'framer-motion'
import { Waves, Ship } from 'lucide-react'
import type { GameComponentProps } from '../registry'

export default function BoatRace({ role }: GameComponentProps) {
  const [boats] = useState([
     { id: '1', name: 'Thuyền Rồng', pos: 300 },
     { id: '2', name: 'Thuyền Hải Tặc', pos: 150 },
     { id: '3', name: 'Thuyền Thiên Nga', pos: 450 },
  ])

  return (
    <div className="flex-col flex-center text-center p-xl">
      <div className="game-card card bg-dark p-xl" style={{ width: '100%', maxWidth: '800px' }}>
         <h2 className="mb-md">Đua Thuyền Rồng</h2>
         <p className="mb-xl">Chèo thuyền nhanh nhất để chạm đích!</p>

         <div className="race-lake" style={{ background: 'var(--color-primary-dark)', padding: '20px', borderRadius: 'var(--radius-lg)', position: 'relative', height: '400px' }}>
            {boats.map(boat => (
               <div key={boat.id} className="boat-lane" style={{ borderBottom: '1px dashed white', height: '120px' }}>
                  <motion.div animate={{ x: boat.pos }} style={{ display: 'inline-block' }}>
                     <Ship size={32} />
                     <p>{boat.name}</p>
                  </motion.div>
               </div>
            ))}
            <Waves size={48} color="white" opacity={0.3} style={{ position: 'absolute', bottom: '10px', right: '10px' }} />
         </div>

         {role === 'teacher' && (
           <p className="mt-xl" style={{ color: 'var(--color-success)' }}>
             Chế độ giáo viên: Điều khiển nhịp chèo cho các đội
           </p>
         )}
      </div>
    </div>
  )
}
