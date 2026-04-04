import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gamepad2, ArrowRight, LogIn } from 'lucide-react'
import { formatRoomCode, isValidRoomCode } from '../../lib/roomCode'
import { useRoom } from '../../hooks/useRoom'
import { useAuth } from '../../hooks/useAuth'
import { useGameStore } from '../../store/gameStore'

export default function JoinRoom() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { joinRoom, loading, error } = useRoom()
  const { user } = useAuth()
  const { setCurrentParticipant } = useGameStore()

  const [code, setCode] = useState(searchParams.get('room') || '')
  const [name, setName] = useState(user?.user_metadata?.display_name || '')
  const [step, setStep] = useState<'code' | 'name'>('code')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [step])

  // Auto-fill from URL
  useEffect(() => {
    const urlRoom = searchParams.get('room')
    if (urlRoom && isValidRoomCode(urlRoom)) {
      setCode(urlRoom)
      if (user?.user_metadata?.display_name) {
        setStep('name')
      }
    }
  }, [searchParams, user])

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRoomCode(e.target.value)
    setCode(formatted)
  }

  const handleCodeSubmit = () => {
    if (isValidRoomCode(code)) {
      setStep('name')
    }
  }

  const handleJoin = async () => {
    if (!name.trim()) return

    const participant = await joinRoom(code, name.trim(), user?.id)
    if (participant) {
      setCurrentParticipant(participant)
      navigate(`/lobby/${code}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'code') handleCodeSubmit()
      else handleJoin()
    }
  }

  return (
    <div className="join-page">
      <motion.div
        className="join-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="join-header">
          <button className="btn btn-ghost" onClick={() => navigate('/')}>
            ← Quay lại
          </button>
        </div>

        <div className="join-content">
          <div className="join-icon">
            <LogIn size={36} />
          </div>

          {step === 'code' ? (
            <>
              <h1 className="join-title">Nhập mã phòng</h1>
              <p className="join-desc">Hỏi giáo viên để lấy mã 6 ký tự</p>

              <input
                ref={inputRef}
                className="input input-lg room-code-input"
                type="text"
                maxLength={6}
                value={code}
                onChange={handleCodeChange}
                onKeyDown={handleKeyDown}
                placeholder="ABC123"
                autoComplete="off"
              />

              <button
                className="btn btn-primary btn-lg join-btn"
                disabled={!isValidRoomCode(code)}
                onClick={handleCodeSubmit}
              >
                Tiếp tục
                <ArrowRight size={20} />
              </button>
            </>
          ) : (
            <>
              <h1 className="join-title">Tên của bạn</h1>
              <p className="join-desc">Phòng: <strong>{code}</strong></p>

              <input
                ref={inputRef}
                className="input"
                type="text"
                maxLength={30}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tên hiển thị..."
                style={{ textAlign: 'center', fontSize: 'var(--text-xl)' }}
              />

              {error && (
                <p className="join-error">{error}</p>
              )}

              <div className="join-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => setStep('code')}
                >
                  ← Đổi mã
                </button>
                <button
                  className="btn btn-primary btn-lg"
                  disabled={!name.trim() || loading}
                  onClick={handleJoin}
                >
                  {loading ? 'Đang vào...' : 'Vào game'}
                  <Gamepad2 size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
