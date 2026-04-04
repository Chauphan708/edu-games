import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gamepad2, GraduationCap, Sparkles } from 'lucide-react'
import '../styles/home.css'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      {/* Animated background particles */}
      <div className="home-bg-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 10}s`,
              fontSize: `${12 + Math.random() * 20}px`,
              opacity: 0.15 + Math.random() * 0.15,
            }}
          >
            {['⚡', '🎯', '🏆', '💡', '🎮', '📚', '🧩', '🎪'][Math.floor(Math.random() * 8)]}
          </div>
        ))}
      </div>

      <div className="home-content">
        {/* Logo & Hero */}
        <motion.div
          className="home-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="home-logo">
            <Gamepad2 size={48} />
          </div>
          <h1 className="home-title">
            <span className="text-gradient">EduGames</span>
          </h1>
          <p className="home-subtitle">
            23 trò chơi tương tác • Real-time multiplayer • AI tạo câu hỏi
          </p>
        </motion.div>

        {/* Role Selection Cards */}
        <motion.div
          className="home-cards"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Teacher Card */}
          <button
            className="role-card role-card--teacher"
            onClick={() => navigate('/teacher')}
          >
            <div className="role-card__icon">
              <GraduationCap size={40} />
            </div>
            <h2 className="role-card__title">Giáo viên</h2>
            <p className="role-card__desc">
              Tạo game, quản lý câu hỏi, theo dõi học sinh real-time
            </p>
            <div className="role-card__features">
              <span>📊 Dashboard</span>
              <span>🤖 AI Generator</span>
              <span>📺 Projector</span>
            </div>
          </button>

          {/* Student Card */}
          <button
            className="role-card role-card--student"
            onClick={() => navigate('/join')}
          >
            <div className="role-card__icon">
              <Sparkles size={40} />
            </div>
            <h2 className="role-card__title">Học sinh</h2>
            <p className="role-card__desc">
              Nhập mã phòng từ giáo viên và bắt đầu chơi ngay
            </p>
            <div className="role-card__features">
              <span>🎮 23 Game</span>
              <span>⚡ Real-time</span>
              <span>🏆 Xếp hạng</span>
            </div>
          </button>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="home-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Powered by Supabase & Gemini AI
        </motion.p>
      </div>
    </div>
  )
}
