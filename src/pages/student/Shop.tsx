import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Check, Lock, ArrowLeft, Coins } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSound } from '../../hooks/useSound'
import { supabase } from '../../lib/supabase'
import Avatar from '../../components/Avatar'

interface ShopItem {
  id: string
  name: string
  category: string
  price: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const RARITY_COLORS = {
  common: 'var(--color-secondary)',
  rare: 'var(--color-primary)',
  epic: 'var(--color-warning)',
  legendary: '#ff00ff'
}

export default function Shop() {
  const navigate = useNavigate()
  const { user, coins, unlockedItems, avatarConfig, setAuth } = useAuth()
  const { playClick, playCollect, playWin } = useSound()
  
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    async function fetchItems() {
      const { data } = await (supabase.from('shop_items') as any).select('*')
      if (data) setItems(data)
      setLoading(false)
    }
    fetchItems()
  }, [])

  const handleEquip = async (item: ShopItem) => {
    if (!user || !unlockedItems.includes(item.id)) return
    
    // Toggle trang bị
    const newConfig = { ...avatarConfig }
    const currentEquipped = newConfig[item.category]
    
    if (currentEquipped === item.id) {
        newConfig[item.category] = null // Tháo ra
    } else {
        newConfig[item.category] = item.id // Mặc vào
    }

    try {
      const { error } = await (supabase.from('student_gamification') as any)
        .update({ avatar_config: newConfig })
        .eq('user_id', user.id)

      if (error) throw error
      setAuth({ avatarConfig: newConfig })
      playClick()
    } catch (err) {
      console.error(err)
    }
  }

  const AvatarPreview = () => (
    <div className="card flex-center flex-col p-2xl mb-2xl text-center relative overflow-hidden" 
         style={{ background: 'var(--color-primary-glow)', border: '2px dashed var(--color-primary)' }}>
       <Avatar config={avatarConfig} size="xl" />
       <h2 className="text-gradient mt-md">Phòng thay đồ của bạn</h2>
       <p className="text-secondary">Tùy chỉnh diện mạo trước khi ra trận!</p>
    </div>
  )

  const handleBuy = async (item: ShopItem) => {
    if (!user || coins < item.price || unlockedItems.includes(item.id)) return
    
    setPurchasing(item.id)
    playClick()

    try {
      const newCoins = coins - item.price
      const newUnlocked = [...unlockedItems, item.id]

      const { error } = await (supabase.from('student_gamification') as any)
        .update({ 
          coins: newCoins, 
          unlocked_items: newUnlocked 
        })
        .eq('user_id', user.id)

      if (error) throw error

      setAuth({ coins: newCoins, unlockedItems: newUnlocked })
      playCollect()
      if (item.rarity === 'legendary') playWin()
      
      alert(`Đã sở hữu thành công ${item.name}!`)
    } catch (err) {
      console.error(err)
      alert('Có lỗi xảy ra khi mua vật phẩm.')
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <div className="page" style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex flex-between items-center p-xl" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> Quay về
        </button>
        
        <div className="flex items-center gap-xl">
          <h1 className="text-xl flex items-center gap-sm" style={{ margin: 0 }}>
            <ShoppingBag className="text-primary" /> Cửa hàng vật phẩm
          </h1>
        </div>

        <div className="badge badge-primary flex items-center gap-sm" style={{ fontSize: '1.2rem', padding: '10px 20px' }}>
          <Coins size={20} /> {coins} Xu
        </div>
      </div>

      <div className="container p-xl">
        <AvatarPreview />
        
        <div className="grid grid-3 gap-xl">
          {loading ? (
             Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card skeleton" style={{ height: 300 }}></div>
             ))
          ) : (
            items.map((item) => {
              const isOwned = unlockedItems.includes(item.id)
              const canAfford = coins >= item.price
              
              return (
                <motion.div
                  key={item.id}
                  className={`card relative overflow-hidden ${isOwned ? 'opacity-75' : ''}`}
                  whileHover={{ y: -5 }}
                  style={{ 
                    borderColor: isOwned ? 'var(--border-color)' : RARITY_COLORS[item.rarity],
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 'var(--space-xl)'
                  }}
                >
                  {/* Rarity Tag */}
                  <div className="absolute" style={{ top: 12, right: 12 }}>
                    <span className="badge" style={{ background: RARITY_COLORS[item.rarity], opacity: 0.2, color: RARITY_COLORS[item.rarity], fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                      {item.rarity}
                    </span>
                  </div>

                    <div className="flex-center py-xl mb-xl" style={{ fontSize: '4rem', background: 'var(--bg-base)', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
                      {item.category === 'hat' && '🤠'}
                      {item.category === 'glasses' && '😎'}
                      {item.category === 'outfit' && '👘'}
                      {item.category === 'pet' && '🦊'}
                      
                      {avatarConfig[item.category] === item.id && (
                        <div className="absolute" style={{ top: 10, left: 10 }}>
                           <span className="badge badge-success">Đang mặc</span>
                        </div>
                      )}
                    </div>

                    <h3 className="mb-xs">{item.name}</h3>
                    <p className="text-secondary text-sm mb-xl">Phụ kiện {item.category}</p>

                    <div className="mt-auto flex flex-between items-center">
                      <div className="flex items-center gap-xs font-bold text-lg">
                        <Coins size={18} className="text-warning" /> {item.price}
                      </div>

                      {isOwned ? (
                         <button 
                            className={`btn ${avatarConfig[item.category] === item.id ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={() => handleEquip(item)}
                          >
                            {avatarConfig[item.category] === item.id ? 'Tháo ra' : 'Trang bị'}
                         </button>
                      ) : (
                        <button
                          className={`btn ${canAfford ? 'btn-primary' : 'btn-secondary'}`}
                          disabled={!canAfford || purchasing === item.id}
                          onClick={() => handleBuy(item)}
                        >
                          {purchasing === item.id ? 'Đang mua...' : 'Sở hữu'}
                        </button>
                      )}
                    </div>

                  {/* Glow Effect for Legendary */}
                  {item.rarity === 'legendary' && (
                    <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 40px rgba(255,0,255,0.1)', border: '2px solid rgba(255,0,255,0.3)' }}></div>
                  )}
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
