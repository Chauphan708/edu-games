import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, Clock, Users, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Reports() {
  const navigate = useNavigate()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const { data } = await (supabase
        .from('session_results')
        .select('*, games(title)')
        .order('completed_at', { ascending: false }) as any)

      if (data) setReports(data)
    } catch (err) {
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reports-page container p-xl">
      <div className="flex items-center gap-md mb-2xl">
        <button className="btn btn-ghost" onClick={() => navigate('/teacher')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex items-center gap-md">
          <BarChart3 size={36} />
          Báo Cáo Kết Quả
        </h1>
      </div>

      {loading ? (
        <div className="flex-center p-2xl">
          <div className="loader"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="card text-center p-2xl">
          <p>Chưa có dữ liệu báo cáo nào.</p>
        </div>
      ) : (
        <div className="grid grid-1 gap-md">
          {reports.map((report) => (
            <motion.div 
               key={report.id} 
               className="card flex flex-between items-center hover-scale"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex-col">
                <h3 className="mb-xs">{report.games?.title || 'Trò chơi không tên'}</h3>
                <div className="flex gap-md text-secondary">
                  <span className="flex items-center gap-xs"><Clock size={16} /> {new Date(report.completed_at).toLocaleString()}</span>
                  <span className="flex items-center gap-xs"><Users size={16} /> {report.total_participants} người chơi</span>
                </div>
              </div>
              <div className="flex-col items-end">
                <div className="badge badge-primary">Điểm TB: {Math.round(report.average_score)}</div>
                <button className="btn btn-ghost btn-sm mt-sm">Chi tiết →</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
