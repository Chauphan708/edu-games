import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

interface BlurImageProps {
  role: 'teacher' | 'student'
}

export default function BlurImage({ role }: BlurImageProps) {
  const MOCK_IMAGE_URL = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' // Ảnh phong cảnh

  // Mức độ Blur cao nhất: 50px, Rõ nhất 0px
  const [blurAmount, setBlurAmount] = useState(40)

  // Tự động mờ dần để demo
  useEffect(() => {
    if (role !== 'teacher') return
    const timer = setInterval(() => {
      setBlurAmount(prev => Math.max(0, prev - 2))
    }, 2000)
    return () => clearInterval(timer)
  }, [role])

  // --- STUDENT VIEW ---
  if (role === 'student') {
    const [guess, setGuess] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = () => {
       if(!guess.trim()) return
       setSubmitted(true)
       // Gửi qua Realtime socket
    }

    return (
      <div className="flex-col gap-xl" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
         <div className="text-center">
           <h3 style={{ marginBottom: 'var(--space-sm)' }}>Đây là hình ảnh gì?</h3>
           <p className="text-secondary">Ai gõ nhanh và đúng nhất sẽ thắng!</p>
         </div>

         {submitted ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card text-center text-success" style={{ borderColor: 'var(--color-success)' }}>
               Hệ thống đã ghi nhận đáp án: <strong>{guess}</strong>
               <br/><br/>
               <span className="text-muted">Hãy nhìn lên bảng xem bạn đoán đúng chưa!</span>
            </motion.div>
         ) : (
           <div className="flex-col gap-md">
             <input 
                type="text" 
                className="input input-lg" 
                placeholder="Nhập dự đoán của bạn..." 
                value={guess}
                onChange={e => setGuess(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
             />
             <button className="btn btn-primary btn-lg" onClick={handleSubmit}>Gửi Đáp Án Khóa Két</button>
           </div>
         )}
      </div>
    )
  }

  // --- TEACHER VIEW (PROJECTOR) ---
  return (
    <div className="flex-col flex-center text-center" style={{ width: '100%' }}>
       <h2 style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>Đoán Tranh Ẩn Giấu</h2>
       <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2xl)' }}>Hình ảnh đang dần rõ nét lại (Độ mờ: {blurAmount}px)</p>
       
       <div style={{ position: 'relative', width: '700px', height: '450px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '4px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <motion.img 
            src={MOCK_IMAGE_URL} 
            alt="Blurred" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            animate={{ filter: `blur(${blurAmount}px)` }}
            transition={{ duration: 0.5 }}
          />

          {/* Icon con mắt nháy */}
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '50%' }}>
             {blurAmount > 10 ? <EyeOff color="white" /> : <Eye color="white" />}
          </div>
       </div>

       {/* Real-time Ticker Đáp án học sinh gửi lên */}
       <div className="card" style={{ marginTop: 'var(--space-2xl)', minWidth: '400px', background: 'var(--bg-surface)' }}>
         <h4 style={{ margin: 0, paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>Dự đoán hiện tại từ lớp:</h4>
         <div className="flex gap-md" style={{ marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="badge badge-quiz">Đà lạt (Lan)</span>
            <span className="badge badge-quiz">Sa Pa (Minh)</span>
            <span className="badge badge-quiz">Rừng thông (Hùng)</span>
         </div>
       </div>
    </div>
  )
}
