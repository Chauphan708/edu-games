import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Key, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { validateApiKey } from '../../lib/gemini'
import { useAuth } from '../../hooks/useAuth'

export default function Settings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    displayName: '',
    school: '',
    geminiApiKey: '',
  })

  // Fetch current settings
  useEffect(() => {
    async function loadSettings() {
      if (!user?.id) {
        setLoading(false)
        return
      }
      
      const { data, error } = await supabase
        .from('teacher_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setFormData({
          displayName: (data as any).display_name || user.user_metadata?.display_name || '',
          school: (data as any).school || '',
          geminiApiKey: (data as any).gemini_api_key || '',
        })
      } else if (!error || (error as any).code === 'PGRST116') {
        // If no settings exist yet, pre-fill from user metadata
         setFormData(prev => ({
           ...prev,
           displayName: user.user_metadata?.display_name || ''
         }))
      }
      setLoading(false)
    }

    loadSettings()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
    setSuccess(null)
  }

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // 1. Validate API Key if provided
      if (formData.geminiApiKey) {
        const isValid = await validateApiKey(formData.geminiApiKey)
        if (!isValid) {
          throw new Error('API Key không hợp lệ hoặc đã hết hạn.')
        }
      }

      // 2. Save to Supabase (Upsert)
      const { error: saveError } = await supabase
        .from('teacher_settings')
        .upsert({
          user_id: user.id,
          display_name: formData.displayName,
          school: formData.school,
          gemini_api_key: formData.geminiApiKey || null,
          updated_at: new Date().toISOString()
        } as any)

      if (saveError) throw saveError

      setSuccess('Đã lưu cài đặt thành công!')
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page flex flex-center">
        <div className="loader mb-md"></div>
        <span>Đang tải cấu hình...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page flex flex-center">
        <div className="card text-center p-2xl">
          <h2 className="mb-md">Chưa đăng nhập</h2>
          <p className="mb-xl text-secondary">Vui lòng truy cập từ hệ thống LMS để sử dụng tính năng này.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Quay lại Trang chủ</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container container-sm">
        {/* Header */}
        <div className="page-header flex flex-between" style={{ alignItems: 'center' }}>
           <button className="btn btn-ghost" onClick={() => navigate('/teacher')} style={{ padding: '8px 0' }}>
            <ArrowLeft size={20} /> Quay lại
          </button>
          <h1 className="page-title" style={{ fontSize: 'var(--text-3xl)' }}>Cài đặt</h1>
          <div style={{ width: 80 }} /> {/* Spacer */}
        </div>

        {/* Form */}
        <div className="card grid gap-lg">
          
          {/* Messages */}
          {error && <div style={{ color: 'var(--color-danger)', padding: 'var(--space-sm)', background: 'rgba(239, 71, 111, 0.1)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
          {success && <div style={{ color: 'var(--color-success)', padding: 'var(--space-sm)', background: 'rgba(6, 214, 160, 0.1)', borderRadius: 'var(--radius-sm)' }}>{success}</div>}

          {/* User Info */}
          <div>
            <h3 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <User size={20} /> Thông tin cá nhân
            </h3>
            <div className="grid gap-md">
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-xs)', color: 'var(--text-secondary)' }}>Tên hiển thị (Giáo viên)</label>
                <input 
                  type="text" 
                  className="input" 
                  name="displayName"
                  value={formData.displayName} 
                  onChange={handleChange}
                  placeholder="VD: Thầy John"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-xs)', color: 'var(--text-secondary)' }}>Trường học / Tổ chức</label>
                <input 
                  type="text" 
                  className="input" 
                  name="school"
                  value={formData.school} 
                  onChange={handleChange}
                  placeholder="VD: THPT Trường Chinh"
                />
              </div>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border-color)' }} />

          {/* AI Settings */}
          <div>
            <h3 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <Key size={20} /> Cấu hình AI (Gemini 2.0 Flash)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-md)' }}>
              Để sử dụng tính năng tự động tạo câu hỏi, bạn cần cung cấp API Key của Google Gemini. Nhận key miễn phí tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Google AI Studio</a>.
            </p>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', color: 'var(--text-secondary)' }}>Gemini API Key</label>
              <input 
                type="password" 
                className="input" 
                name="geminiApiKey"
                value={formData.geminiApiKey} 
                onChange={handleChange}
                placeholder="AIzaSy..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-end" style={{ marginTop: 'var(--space-md)' }}>
             <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : <><Save size={20} /> Lưu cài đặt</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
