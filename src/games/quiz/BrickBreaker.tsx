import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { GameComponentProps } from '../registry'

export default function BrickBreaker({ role }: GameComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Simple Brick Breaker Logic (Placeholder)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'var(--color-primary)'
    ctx.fillRect(100, 100, 200, 20) // Paddle
    ctx.beginPath()
    ctx.arc(150, 150, 10, 0, Math.PI * 2) // Ball
    ctx.fill()
  }, [])

  return (
    <div className="flex-col flex-center text-center p-xl">
      <div className="game-card card bg-dark p-xl" style={{ width: '100%', maxWidth: '600px' }}>
         <h2 className="mb-md">Linh hoạt Phá gạch</h2>
         <p className="mb-xl">Phá vỡ các viên gạch để giải đố và nhận câu trả lời!</p>

         <canvas 
            ref={canvasRef} 
            width={500} 
            height={400} 
            style={{ 
              width: '100%', 
              maxWidth: '500px', 
              background: '#111', 
              borderRadius: 'var(--radius-lg)' 
            }}
         />

         {role === 'teacher' && (
           <p className="mt-xl" style={{ color: 'var(--color-success)' }}>
             Chế độ giáo viên: Quan sát học sinh đang phá gạch
           </p>
         )}
      </div>

      <div className="mt-xl grid grid-4 gap-sm">
         {[1, 2, 3, 4].map(btn => (
            <button key={btn} className="btn btn-secondary">Câu trả lời {btn}</button>
         ))}
      </div>
    </div>
  )
}
