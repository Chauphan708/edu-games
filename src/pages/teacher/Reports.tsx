import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, Users, ArrowLeft, Target, TrendingUp, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { GAME_REGISTRY } from '../../store/gameStore'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658']

export default function Reports() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [attempts, setAttempts] = useState<any[]>([])
  const [profiles, setProfiles] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'student' | 'topics'>('overview')
  const [selectedStudent, setSelectedStudent] = useState<string>('all')

  useEffect(() => {
    if (user?.id) fetchReports()
  }, [user?.id])

  const fetchReports = async () => {
    setLoading(true)
    try {
      // 1. Fetch game attempts
      const { data: attemptsData, error: attemptErr } = await (supabase
        .from('game_attempts')
        .select('*')
        .eq('teacher_id', user!.id)
        .order('played_at', { ascending: false }) as any)

      if (attemptErr) throw attemptErr

      const attemptsList = attemptsData || []
      setAttempts(attemptsList)

      // 2. Fetch student names maps
      const studentIds = [...new Set(attemptsList.map((a: any) => a.student_id).filter(Boolean))] as string[]
      if (studentIds.length > 0) {
        const { data: profileData } = await (supabase
          .from('profiles')
          .select('id, name')
          .in('id', studentIds) as any)
        
        if (profileData) {
           const profileMap: Record<string, string> = {}
           profileData.forEach((p: any) => profileMap[p.id] = p.name)
           setProfiles(profileMap)
        }
      }
    } catch (err) {
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }

  // --- DATA PROCESSING FOR CHARTS ---

  // 1. Game Preference Pie Chart
  const gameTypeData = useMemo(() => {
    const counts: Record<string, number> = {}
    attempts.forEach(a => {
       counts[a.game_type] = (counts[a.game_type] || 0) + 1
    })
    return Object.entries(counts).map(([type, value]) => ({
      name: GAME_REGISTRY.find(g => g.type === type)?.name || type,
      value
    }))
  }, [attempts])

  // 2. Knowledge Radar (Student Specific or Avg)
  const radarData = useMemo(() => {
    const dataToProcess = selectedStudent === 'all' 
       ? attempts 
       : attempts.filter(a => a.student_id === selectedStudent)
       
    const topicScores: Record<string, { total: number, count: number }> = {}
    dataToProcess.forEach(a => {
      const gType = GAME_REGISTRY.find(g => g.type === a.game_type)?.groupLabel || 'Khác'
      if (!topicScores[gType]) topicScores[gType] = { total: 0, count: 0 }
      topicScores[gType].total += (a.score || 0)
      topicScores[gType].count += 1
    })

    return Object.entries(topicScores).map(([subject, stats]) => ({
      subject,
      'Điểm TB': Math.round(stats.total / stats.count),
      fullMark: 20
    }))
  }, [attempts, selectedStudent])

  // 3. Activity Bar Chart (Last 7 dates)
  const activityData = useMemo(() => {
     const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        return d.toISOString().split('T')[0]
     }).reverse()

     return last7Days.map(dateStr => {
        const count = attempts.filter(a => a.played_at.startsWith(dateStr)).length
        return { date: dateStr.substring(5), plays: count } /* show MM-DD */
     })
  }, [attempts])

  // 4. Knowledge Gaps (Topics with lowest scores)
  const knowledgeGaps = useMemo(() => {
      // Dựa vào accuracy_rate hoặc score. Hiện tại dùng Avg Score
      const topicScores: Record<string, { total: number, count: number }> = {}
      attempts.forEach(a => {
        const topic = a.topic || GAME_REGISTRY.find(g => g.type === a.game_type)?.groupLabel || 'Chưa phân loại'
        if (!topicScores[topic]) topicScores[topic] = { total: 0, count: 0 }
        topicScores[topic].total += (a.score || 0)
        topicScores[topic].count += 1
      })
      
      const sorted = Object.entries(topicScores).map(([topic, stats]) => ({
         topic,
         avgScore: +(stats.total / stats.count).toFixed(1)
      })).sort((a,b) => a.avgScore - b.avgScore)
      
      return sorted.slice(0, 5) // Lấy 5 cái yếu nhất
  }, [attempts])


  if (loading) return <div className="page flex flex-center"><div className="loader"></div></div>

  return (
    <div className="reports-page container p-xl">
      <div className="flex items-center gap-md mb-xl">
        <button className="btn btn-ghost" onClick={() => navigate('/teacher')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex items-center gap-md">
          <BarChart3 size={36} /> Analytics Dashboard
        </h1>
      </div>

      <div className="tabs flex gap-sm mb-2xl">
         <button className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('overview')}>📊 Tổng Quan Lớp</button>
         <button className={`btn ${activeTab === 'student' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('student')}>🧑‍🎓 Phân Tích Cá Nhân</button>
         <button className={`btn ${activeTab === 'topics' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('topics')}>🚨 Lỗ Hổng Kiến Thức</button>
      </div>

      {attempts.length === 0 ? (
        <div className="card text-center p-2xl text-muted">Chưa có dữ liệu trò chơi nào để phân tích. Hãy chia sẻ mã phòng cho học sinh!</div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-2xl">
           
           {/* TAB 1: OVERVIEW */}
           {activeTab === 'overview' && (
             <>
               <div className="grid grid-3 gap-md">
                  <div className="card bg-surface flex items-center gap-md">
                     <div className="p-sm" style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)', borderRadius: '50%' }}><TrendingUp size={24} /></div>
                     <div><div className="text-2xl font-bold">{attempts.length}</div><div className="text-muted text-sm">Tổng lượt chơi</div></div>
                  </div>
                  <div className="card bg-surface flex items-center gap-md">
                     <div className="p-sm" style={{ background: 'var(--color-success-glow)', color: 'var(--color-success)', borderRadius: '50%' }}><Users size={24} /></div>
                     <div><div className="text-2xl font-bold">{Object.keys(profiles).length}</div><div className="text-muted text-sm">Học sinh tham gia</div></div>
                  </div>
                  <div className="card bg-surface flex items-center gap-md">
                     <div className="p-sm" style={{ background: 'var(--color-warning-glow)', color: 'var(--color-warning)', borderRadius: '50%' }}><Target size={24} /></div>
                     <div><div className="text-2xl font-bold">{gameTypeData.length > 0 ? gameTypeData.sort((a,b)=>b.value-a.value)[0].name : 'N/A'}</div><div className="text-muted text-sm">Game Yêu Thích</div></div>
                  </div>
               </div>

               <div className="grid grid-2 gap-xl">
                  <div className="card">
                     <h3 className="mb-md">Tần Suất Chơi (7 Ngày Qua)</h3>
                     <div style={{ height: 300 }}>
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={activityData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} />
                           <XAxis dataKey="date" />
                           <YAxis />
                           <RechartsTooltip />
                           <Bar dataKey="plays" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                         </BarChart>
                       </ResponsiveContainer>
                     </div>
                  </div>
                  <div className="card">
                     <h3 className="mb-md">Trò Chơi Được Yêu Thích Tỉ Lệ</h3>
                     <div style={{ height: 300 }}>
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie data={gameTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                             {gameTypeData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                           </Pie>
                           <RechartsTooltip />
                           <Legend />
                         </PieChart>
                       </ResponsiveContainer>
                     </div>
                  </div>
               </div>
             </>
           )}

           {/* TAB 2: STUDENT INSIGHTS */}
           {activeTab === 'student' && (
             <div className="grid grid-2 gap-xl">
                <div className="card">
                    <h3 className="mb-md">Lịch Sử Cá Nhân</h3>
                    <select className="input mb-md" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                        <option value="all">-- Toàn bộ học sinh --</option>
                        {Object.entries(profiles).map(([id, name]) => (
                           <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                    
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                       {attempts.filter(a => selectedStudent === 'all' || a.student_id === selectedStudent).map(a => (
                          <div key={a.id} className="flex flex-between p-sm border-b" style={{ borderColor: 'var(--border-color)' }}>
                             <div>
                                <b>{GAME_REGISTRY.find(g => g.type === a.game_type)?.name || 'Game'}</b>
                                <div className="text-xs text-muted">{new Date(a.played_at).toLocaleString()} {selectedStudent === 'all' && `- ${profiles[a.student_id] || 'Ẩn danh'}`}</div>
                             </div>
                             <div className="badge badge-primary">+{a.score} điểm</div>
                          </div>
                       ))}
                    </div>
                </div>
                
                <div className="card">
                   <h3 className="mb-md">Radar Năng Lực {selectedStudent !== 'all' ? `(${profiles[selectedStudent]})` : '(Lớp)'}</h3>
                   <div style={{ height: 400 }}>
                     <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                         <PolarGrid />
                         <PolarAngleAxis dataKey="subject" />
                         <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 5']} />
                         <Radar name="Điểm TB" dataKey="Điểm TB" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.6} />
                         <RechartsTooltip />
                       </RadarChart>
                     </ResponsiveContainer>
                   </div>
                </div>
             </div>
           )}

           {/* TAB 3: KNOWLEDGE GAPS */}
           {activeTab === 'topics' && (
              <div className="card">
                 <h3 className="mb-md flex items-center gap-sm">
                    <AlertTriangle color="var(--color-danger)" /> 
                    Cảnh Báo Sớm: Các chủ đề yếu nhất
                 </h3>
                 <p className="text-secondary mb-xl">Hệ thống phân tích và liệt kê các chủ đề có điểm trung bình thấp nhất để giáo viên xem xét ôn tập lại.</p>
                 
                 <div className="grid gap-sm">
                    {knowledgeGaps.length === 0 ? <p>Mọi thứ đang rất tốt!</p> : knowledgeGaps.map((g, index) => (
                       <div key={index} className="flex flex-between items-center p-md bg-surface" style={{ borderRadius: 'var(--radius-sm)' }}>
                          <span className="font-bold text-lg">{index + 1}. {g.topic}</span>
                          <span className="badge badge-danger">Điểm TB: {g.avgScore}</span>
                       </div>
                    ))}
                 </div>
              </div>
           )}

        </motion.div>
      )}
    </div>
  )
}
