import { useState } from 'react'
import { Compass, Zap } from 'lucide-react'
import type { GameComponentProps } from '../registry'

export default function SnakesLadders({ role }: GameComponentProps) {
  const [teams] = useState([
     { id: '1', name: 'Đội Rồng', pos: 5 },
     { id: '2', name: 'Đội Hổ', pos: 12 },
     { id: '3', name: 'Đội Phượng', pos: 8 },
  ])

  return (
    <div className="flex-col flex-center text-center p-xl">
      <div className="game-card card bg-dark p-xl" style={{ width: '100%', maxWidth: '600px' }}>
         <h2 className="mb-md">Rắn Và Cầu Thang</h2>
         <p className="mb-xl">Trả lời đúng để leo thang, trả lời sai coi chừng bị rắn nuốt!</p>

         <div className="board-grid grid grid-10 gap-sm" style={{ background: '#111', padding: '10px', borderRadius: 'var(--radius-lg)' }}>
            {Array.from({ length: 100 }).map((_, i) => (
               <div key={i} className="flex-center" style={{ width: '30px', height: '30px', background: '#222', borderRadius: '4px', fontSize: '10px' }}>
                  {100 - i}
                  {/* Avatar đội nếu đang ở ô này */}
                  {teams.some(team => team.pos === (100 - i)) && (
                    <div style={{ position: 'absolute', width: '16px', height: '16px', background: 'var(--color-primary)', borderRadius: '50%' }}></div>
                  )}
               </div>
            ))}
         </div>

         {role === 'teacher' && (
           <p className="mt-xl" style={{ color: 'var(--color-success)' }}>
             Chế độ giáo viên: Điều khiển tung xúc xắc và di chuyển các đội
           </p>
         )}
      </div>

      <div className="mt-xl flex gap-md">
         <button className="btn btn-primary" onClick={() => {}}>
            <Compass size={20} /> Tung xúc xắc
         </button>
         <button className="btn btn-secondary" onClick={() => {}}>
            <Zap size={20} /> Dùng vật phẩm
         </button>
      </div>
    </div>
  )
}
