import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileOutput, Users, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function Reports() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReports() {
      if (!user?.id) return
      
      // Lấy lịch sử từ bảng session_results + join với games để lấy tên bài
      const { data, error } = await supabase
        .from('session_results')
        .select(`
          *,
          games ( title )
        `)
        .eq('teacher_id', user.id)
        .order('completed_at', { ascending: false })

      if (data) {
        setReports(data)
      }
      setLoading(false)
    }

    fetchReports()
  }, [user])

  return (
    <div className="page">
      <div className="container">
         <div className="page-header flex flex-between" style={{ alignItems: 'center' }}>
           <div className="flex" style={{ gap: 'var(--space-md)', alignItems: 'center' }}>
             <button className="btn btn-ghost btn-icon" onClick={() => navigate('/teacher')}>
              <ArrowLeft size={20} />
             </button>
             <h1 className="page-title" style={{ fontSize: 'var(--text-3xl)', margin: 0 }}>Báo cáo Tổng hợp</h1>
           </div>
           <button className="btn btn-secondary">
             <FileOutput size={20} /> Xuất CSV
           </button>
        </div>

        {loading ? (
          <div className="text-center" style={{ padding: 'var(--space-3xl)' }}>Đang tải báo cáo...</div>
        ) : reports.length === 0 ? (
          <div className="card text-center" style={{ padding: 'var(--space-3xl)' }}>
            Chưa có báo cáo nào. Hãy bắt đầu tổ chức game đầu tiên!
          </div>
        ) : (
          <div className="grid gap-md">
            {reports.map((report) => (
               <div key={report.id} className="card flex flex-between" style={{ alignItems: 'center' }}>
                  <div>
                    <h3 style={{ marginBottom: 'var(--space-xs)' }}>{report.games?.title || 'Game Không Xác Định'}</h3>
                    <div className="flex gap-md" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                       <span className="flex" style={{ gap: '4px', alignItems: 'center' }}>
                         <Calendar size={14}/> 
                         {new Date(report.completed_at).toLocaleDateString('vi-VN')} 
                         ({new Date(report.completed_at).toLocaleTimeString('vi-VN')})
                       </span>
                       <span className="flex" style={{ gap: '4px', alignItems: 'center' }}>
                         <Users size={14}/> {report.player_count} Học sinh
                       </span>
                    </div>
                  </div>
                  
                  <button className="btn btn-primary btn-sm">Xem chi tiết</button>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
