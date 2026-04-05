import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Coins, Star, ArrowLeft, Medal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Avatar from '../../components/Avatar'

interface LeaderboardEntry {
  user_id: string
  coins: number
  xp: number
  level: number
  avatar_config: any
  display_name?: string
}

export default function Leaderboard() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data } = await (supabase.from('student_gamification') as any)
        .select('*')
        .order('coins', { ascending: false })
        .limit(20)

      if (data) setEntries(data)
      setLoading(false)
    }
    fetchLeaderboard()
  }, [])

  return (
    <div className="page" style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <div className="container container-sm p-xl">
        <button className="btn btn-ghost mb-xl" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> Quay về
        </button>

        <div className="text-center mb-2xl">
          <Trophy size={64} className="text-warning mx-auto mb-md" />
          <h1 className="text-2xl mb-sm text-gradient">Bảng Xếp Hạng Đại Gia</h1>
          <p className="text-secondary text-lg">Vinh danh những học sinh chăm chỉ tích luỹ Xu nhất.</p>
        </div>

        <div className="grid gap-md">
          {loading ? (
             Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card skeleton" style={{ height: 80 }}></div>
             ))
          ) : (
            entries.map((entry, index) => {
              const isTop3 = index < 3
              
              return (
                <motion.div
                  key={entry.user_id}
                  className={`card flex items-center gap-xl p-xl ${isTop3 ? 'selected' : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    background: isTop3 ? 'var(--color-primary-glow)' : 'var(--bg-surface)',
                    borderColor: isTop3 ? 'var(--color-primary)' : 'var(--border-color)',
                  }}
                >
                  {/* Rank Number / Medal */}
                  <div className="flex-center" style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--bg-base)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {index === 0 ? <Medal color="#FFD700" size={32} /> : 
                     index === 1 ? <Medal color="#C0C0C0" size={32} /> : 
                     index === 2 ? <Medal color="#CD7F32" size={32} /> : 
                     index + 1}
                  </div>

                  {/* Avatar Component */}
                  <Avatar config={entry.avatar_config} size="md" />

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <h3 className="mb-xs">Học sinh ẩn danh #{entry.user_id.slice(-4)}</h3>
                    <div className="flex items-center gap-md text-sm text-secondary">
                      <span className="badge badge-sm">Cấp {entry.level}</span>
                      <span className="flex items-center gap-xs"><Star size={14} /> {entry.xp} XP</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-sm font-bold text-xl" style={{ color: 'var(--color-warning)' }}>
                    <Coins size={20} /> {entry.coins}
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
