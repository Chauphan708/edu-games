import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Settings, BarChart3, Gamepad2 } from 'lucide-react'
import { GAME_REGISTRY, GROUP_LABELS } from '../../store/gameStore'
import type { GameGroup } from '../../types/supabase'

export default function GameLibrary() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeGroup, setActiveGroup] = useState<GameGroup | 'all'>('all')

  const filteredGames = GAME_REGISTRY.filter((game: any) => {
    const name = game.name || ''
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase())
    const matchesGroup = activeGroup === 'all' || game.group === activeGroup
    return matchesSearch && matchesGroup
  })

  return (
    <div className="game-library container p-xl">
      <div className="flex flex-between items-center mb-2xl">
        <h1 className="flex items-center gap-md">
          <Gamepad2 size={36} />
          Kho Trò Chơi
        </h1>
        <div className="flex gap-md">
          <button className="btn btn-primary" onClick={() => navigate('/teacher/bulk-create')}>
            ⚡ Tạo Hàng Loạt
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/teacher/settings')}>
            <Settings size={20} /> Cài đặt
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/teacher/reports')}>
            <BarChart3 size={20} /> Báo cáo
          </button>
        </div>
      </div>

      <div className="card flex flex-between items-center mb-xl p-md">
        <div className="flex gap-sm">
          <button 
            className={`btn ${activeGroup === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveGroup('all')}
          >
            Tất cả
          </button>
          {Object.entries(GROUP_LABELS).map(([key, label]) => (
            <button 
              key={key}
              className={`btn ${activeGroup === key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveGroup(key as GameGroup)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm trò chơi..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-3 gap-xl">
        {(filteredGames as any[]).map((game) => (
          <div 
            key={game.type}
            className="game-card card hover-scale"
          >
            <div className="game-card__icon" style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>
              {game.icon}
            </div>
            <h3 className="mb-sm">{game.name}</h3>
            <p className="text-secondary mb-xl">{game.description}</p>
            <div className="flex flex-between items-center mt-auto">
              <span className="badge badge-secondary">{(GROUP_LABELS as any)[game.group]}</span>
              <button 
                className="btn btn-primary"
                onClick={() => navigate(`/teacher/create/${game.type}`)}
              >
                Chọn trò chơi
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
