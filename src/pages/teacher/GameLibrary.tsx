import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Settings, BarChart3, Gamepad2 } from 'lucide-react'
import { GAME_REGISTRY, GROUP_LABELS, type GameRegistryItem } from '../../store/gameStore'
import type { GameGroup } from '../../types/supabase'

const GROUPS: (GameGroup | 'all')[] = ['all', 'quiz', 'vocabulary', 'strategy', 'creative', 'team']
const GROUP_ALL_LABEL = '🎮 Tất cả'

export default function GameLibrary() {
  const navigate = useNavigate()
  const [activeGroup, setActiveGroup] = useState<GameGroup | 'all'>('all')
  const [search, setSearch] = useState('')

  const filteredGames = GAME_REGISTRY.filter(game => {
    const matchGroup = activeGroup === 'all' || game.group === activeGroup
    const matchSearch = game.name.toLowerCase().includes(search.toLowerCase()) ||
      game.description.toLowerCase().includes(search.toLowerCase())
    return matchGroup && matchSearch
  })

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="page-header flex flex-between">
          <div>
            <h1 className="page-title">Thư Viện Game</h1>
            <p className="page-subtitle">23 trò chơi tương tác • Chọn game để tạo phiên mới</p>
          </div>
          <div className="flex gap-sm">
            <button className="btn btn-ghost btn-icon" onClick={() => navigate('/teacher/reports')}>
              <BarChart3 size={20} />
            </button>
            <button className="btn btn-ghost btn-icon" onClick={() => navigate('/teacher/settings')}>
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-md" style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: 40 }}
              placeholder="Tìm game..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Group Tabs */}
        <div className="group-tabs">
          {GROUPS.map(group => (
            <button
              key={group}
              className={`group-tab ${activeGroup === group ? 'group-tab--active' : ''}`}
              onClick={() => setActiveGroup(group)}
              data-group={group}
            >
              {group === 'all' ? GROUP_ALL_LABEL : GROUP_LABELS[group]}
            </button>
          ))}
        </div>

        {/* Game Grid */}
        <div className="grid grid-auto stagger-children">
          {filteredGames.map((game, index) => (
            <GameCard
              key={game.type}
              game={game}
              index={index}
              onClick={() => navigate(`/teacher/create/${game.type}`)}
            />
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="flex flex-center flex-col gap-md" style={{ padding: 'var(--space-3xl)', color: 'var(--text-muted)' }}>
            <Gamepad2 size={48} />
            <p>Không tìm thấy game phù hợp</p>
          </div>
        )}
      </div>
    </div>
  )
}

function GameCard({ game, index, onClick }: { game: GameRegistryItem; index: number; onClick: () => void }) {
  const groupColor = `var(--group-${game.group})`

  return (
    <motion.button
      className="card game-library-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      style={{ textAlign: 'left', cursor: 'pointer', width: '100%', fontFamily: 'inherit', color: 'inherit' }}
    >
      <div className="flex flex-between" style={{ marginBottom: 'var(--space-md)' }}>
        <span style={{ fontSize: '2rem' }}>{game.icon}</span>
        <span className={`badge badge-${game.group}`}>{game.groupLabel}</span>
      </div>

      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
        {game.name}
      </h3>

      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.5 }}>
        {game.description}
      </p>

      <div style={{
        fontSize: 'var(--text-xs)',
        color: groupColor,
        opacity: 0.8,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-xs)',
      }}>
        ⚡ {game.realtimeFeature}
      </div>
    </motion.button>
  )
}
