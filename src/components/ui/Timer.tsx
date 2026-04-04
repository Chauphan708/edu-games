import { useEffect, useState, useRef } from 'react'
import './Timer.css'

interface TimerProps {
  duration: number // seconds
  onTimeUp?: () => void
  paused?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'bar' | 'circle'
}

export default function Timer({
  duration,
  onTimeUp,
  paused = false,
  size = 'md',
  variant = 'bar',
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const intervalRef = useRef<number | null>(null)
  const isUrgent = timeLeft <= 5
  const progress = timeLeft / duration

  useEffect(() => {
    setTimeLeft(duration)
  }, [duration])

  useEffect(() => {
    if (paused || timeLeft <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeLeft <= 0) onTimeUp?.()
      return
    }

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused, timeLeft <= 0]) // eslint-disable-line

  if (variant === 'circle') {
    const radius = size === 'lg' ? 54 : size === 'md' ? 40 : 28
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference * (1 - progress)
    const svgSize = radius * 2 + 12

    return (
      <div className={`timer-circle timer--${size} ${isUrgent ? 'timer--urgent' : ''}`}>
        <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
          <circle
            className="timer-circle__bg"
            cx={svgSize / 2} cy={svgSize / 2} r={radius}
            fill="none" strokeWidth="6"
          />
          <circle
            className="timer-circle__progress"
            cx={svgSize / 2} cy={svgSize / 2} r={radius}
            fill="none" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span className="timer-circle__text">{timeLeft}</span>
      </div>
    )
  }

  return (
    <div className={`timer-bar timer--${size} ${isUrgent ? 'timer--urgent' : ''}`}>
      <div className="timer-bar__track">
        <div
          className="timer-bar__fill"
          style={{
            width: `${progress * 100}%`,
            transition: 'width 1s linear',
          }}
        />
      </div>
      <span className="timer-bar__text">{timeLeft}s</span>
    </div>
  )
}
