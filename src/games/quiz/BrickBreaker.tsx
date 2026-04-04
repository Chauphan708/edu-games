import { useState, useEffect, useRef } from 'react'

interface BrickBreakerProps {
  role: 'teacher' | 'student'
}

export default function BrickBreaker({ role }: BrickBreakerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // --- TEACHER VIEW (CANVAS ENGINE) ---
  useEffect(() => {
    if (role !== 'teacher') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Basic Physics Simulation
    let animationFrameId: number
    const ball = { x: canvas.width / 2, y: canvas.height - 30, dx: 4, dy: -4, radius: 10 }
    
    // Tạo grid gạch
    const brickRowCount = 5
    const brickColumnCount = 9
    const brickWidth = 75
    const brickHeight = 20
    const brickPadding = 10
    const brickOffsetTop = 30
    const brickOffsetLeft = 30
    const bricks: any[][] = []
    
    for(let c=0; c<brickColumnCount; c++) {
        bricks[c] = []
        for(let r=0; r<brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 }
        }
    }

    const drawBall = () => {
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2)
      ctx.fillStyle = "#06D6A0"
      ctx.fill()
      ctx.closePath()
    }

    const drawBricks = () => {
      for(let c=0; c<brickColumnCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
          if(bricks[c][r].status === 1) {
            const brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft
            const brickY = (r*(brickHeight+brickPadding))+brickOffsetTop
            bricks[c][r].x = brickX
            bricks[c][r].y = brickY
            ctx.beginPath()
            ctx.rect(brickX, brickY, brickWidth, brickHeight)
            ctx.fillStyle = `hsl(${c * 40}, 80%, 60%)`
            ctx.fill()
            ctx.closePath()
          }
        }
      }
    }

    const collisionDetection = () => {
      for(let c=0; c<brickColumnCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
          const b = bricks[c][r]
          if(b.status === 1) {
            if(ball.x > b.x && ball.x < b.x+brickWidth && ball.y > b.y && ball.y < b.y+brickHeight) {
              ball.dy = -ball.dy
              b.status = 0 // Phá vỡ gạch
            }
          }
        }
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawBricks()
      drawBall()
      collisionDetection()

      if(ball.x + ball.dx > canvas.width-ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx
      }
      if(ball.y + ball.dy < ball.radius || ball.y + ball.dy > canvas.height-ball.radius) {
        ball.dy = -ball.dy
      }

      ball.x += ball.dx
      ball.y += ball.dy

      animationFrameId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationFrameId)
  }, [role])


  // --- STUDENT VIEW ---
  if (role === 'student') {
    return (
      <div className="flex-col gap-md" style={{ width: '100%', maxWidth: '800px' }}>
         <div className="card text-center" style={{ fontSize: 'var(--text-xl)', padding: 'var(--space-2xl)' }}>
            Ai là người tìm ra Định lý lực hấp dẫn?
         </div>
         <div className="grid grid-2 gap-md">
            {['Galileo', 'Einstein', 'Newton', 'Tesla'].map(opt => (
               <button key={opt} className="btn btn-secondary btn-lg" style={{ height: '80px' }}>
                  {opt}
               </button>
            ))}
         </div>
         <div className="text-center text-muted" style={{ marginTop: 'var(--space-md)' }}>
           Trả lời đúng để nạp năng lượng bắn bóng! 🚀
         </div>
      </div>
    )
  }

  // --- TEACHER VIEW ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%' }}>
       <h2 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>Ai là người tìm ra Định lý lực hấp dẫn?</h2>
       <p style={{ color: 'var(--color-primary-light)', marginBottom: 'var(--space-xl)' }}>
         Lớp đang trả lời... Cố gắng phá vỡ toàn bộ viên gạch!
       </p>
       
       <div style={{ background: '#1a1a2e', borderRadius: 'var(--radius-lg)', padding: 'var(--space-sm)', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
         <canvas 
           ref={canvasRef} 
           width={800} 
           height={400} 
           style={{ background: '#16213e', borderRadius: 'var(--radius-md)' }}
         />
       </div>
    </div>
  )
}
