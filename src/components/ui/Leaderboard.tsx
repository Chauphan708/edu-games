import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Award } from 'lucide-react'
import { formatScore } from '../../lib/scoring'
import './Leaderboard.css'

interface LeaderboardEntry {
  id: string
  name: string
  score: number
  streak?: number
  avatarSeed?: string
  isCorrect?: boolean
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  maxVisible?: number
  highlightId?: string
  showAnimation?: boolean
  compact?: boolean
}

const RANK_ICONS = [
  <Trophy size={20} style={{ color: '#FFD700' }} />,
  <Medal size={20} style={{ color: '#C0C0C0' }} />,
  <Award size={20} style={{ color: '#CD7F32' }} />,
]

export default function Leaderboard({
  entries,
  maxVisible = 10,
  highlightId,
  showAnimation = true,
  compact = false,
}: LeaderboardProps) {
  const sorted = [...entries].sort((a, b) => b.score - a.score).slice(0, maxVisible)

  return (
    <div className={`leaderboard ${compact ? 'leaderboard--compact' : ''}`}>
      <div className="leaderboard__header">
        <Trophy size={18} />
        <span>Bảng Xếp Hạng</span>
        <span className="leaderboard__count">{entries.length} người chơi</span>
      </div>

      <div className="leaderboard__list">
        <AnimatePresence mode="popLayout">
          {sorted.map((entry, index) => (
            <motion.div
              key={entry.id}
              className={`leaderboard__item ${highlightId === entry.id ? 'leaderboard__item--highlight' : ''}`}
              layout={showAnimation}
              initial={showAnimation ? { opacity: 0, x: -20 } : false}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {/* Rank */}
              <div className="leaderboard__rank">
                {index < 3 ? RANK_ICONS[index] : (
                  <span className="leaderboard__rank-num">{index + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <div className="leaderboard__avatar" style={{
                background: `hsl(${(entry.name.charCodeAt(0) * 37) % 360}, 60%, 40%)`
              }}>
                {entry.name.charAt(0).toUpperCase()}
              </div>

              {/* Name */}
              <div className="leaderboard__name">
                {entry.name}
                {entry.streak && entry.streak >= 3 && (
                  <span className="leaderboard__streak">🔥{entry.streak}</span>
                )}
              </div>

              {/* Score */}
              <div className="leaderboard__score">
                {formatScore(entry.score)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
