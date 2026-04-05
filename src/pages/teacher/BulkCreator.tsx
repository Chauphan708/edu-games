import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Sparkles, CheckSquare, Square } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { GAME_REGISTRY } from '../../store/gameStore'
import { buildQuizPrompt, generateGameContent } from '../../lib/gemini'
import type { Question, GameType } from '../../types/supabase'

// Danh sách các game "phù hợp nhất" để chọn mặc định
const DEFAULT_SELECTED_TYPES: GameType[] = [
  'speed-quiz',
  'true-false',
  'word-scramble',
  'matching-wires',
  'sort-order',
  'wheel-spin'
]

export default function BulkCreator() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  
  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  
  // Game Selection State
  const [selectedTypes, setSelectedTypes] = useState<Set<GameType>>(new Set(DEFAULT_SELECTED_TYPES))
  
  // AI State
  const [aiTopic, setAiTopic] = useState('')
  const [aiCount] = useState(5) // Mặc định 5 câu
  const [generating, setGenerating] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [geminiKey, setGeminiKey] = useState<string | null>(null)
  
  // Processing State
  const [saving, setSaving] = useState(false)
  
  // Bank Import State
  const [showBankModal, setShowBankModal] = useState(false)
  const [bankQuestions, setBankQuestions] = useState<any[]>([])
  const [selectedBankIds, setSelectedBankIds] = useState<Set<string>>(new Set())
  const [loadingBank, setLoadingBank] = useState(false)

  // Tự động lấy API Key từ cấu hình giáo viên
  useEffect(() => {
    if (user?.id) {
       supabase
         .from('teacher_settings')
         .select('gemini_api_key')
         .eq('user_id', user.id)
         .single()
         .then(({ data }) => {
            if (data) setGeminiKey((data as any).gemini_api_key)
         })
    }
  }, [user?.id])

  if (authLoading) {
    return <div className="page flex flex-center"><div className="loader"></div></div>
  }

  // --- ACTIONS ---
  
  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return
    if (!geminiKey) {
       setAiError('Vui lòng cài đặt Gemini API Key trong phần Cài đặt.')
       return
    }
    setGenerating(true)
    setAiError(null)
    try {
      const prompt = buildQuizPrompt(aiTopic, aiCount, 'medium')
      const content = await generateGameContent(geminiKey, prompt)
      if (content && Array.isArray(content.questions)) {
        setQuestions(prev => [...prev, ...content.questions])
        setAiTopic('')
      }
    } catch (err: any) {
      setAiError(err.message || 'Lỗi AI')
    } finally {
      setGenerating(false)
    }
  }

  const handleBulkSave = async () => {
    if (!title.trim() || questions.length === 0 || selectedTypes.size === 0 || !user) {
      alert('Vui lòng nhập tiêu đề, câu hỏi và chọn ít nhất 1 loại game!')
      return
    }
    
    setSaving(true)
    try {
      const gamesToInsert = Array.from(selectedTypes).map(type => {
        const gameInfo = GAME_REGISTRY.find(g => g.type === type)
        return {
          teacher_id: user.id,
          title: `${title}`, // Có thể thêm hậu tố tên game nếu muốn
          description,
          game_type: type,
          group_name: gameInfo?.group || 'quiz',
          questions,
          settings: {},
          is_public: false
        }
      })

      const { error } = await supabase
        .from('games')
        .insert(gamesToInsert as any) // Ép kiểu any để tránh lỗi tsc với Supabase Insert mảng

      if (error) throw error
      alert(`Đã tạo thành công ${gamesToInsert.length} trò chơi!`)
      navigate('/teacher')
    } catch (err) {
      console.error(err)
      alert('Lỗi khi tạo hàng loạt trò chơi')
    } finally {
      setSaving(false)
    }
  }

  const toggleType = (type: GameType) => {
    const next = new Set(selectedTypes)
    if (next.has(type)) next.delete(type)
    else next.add(type)
    setSelectedTypes(next)
  }

  const fetchBankQuestions = async () => {
    if (!user?.id) return
    setLoadingBank(true)
    try {
      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setBankQuestions(data || [])
    } catch (err) {
      alert('Lỗi lấy Ngân hàng')
    } finally {
      setLoadingBank(false)
    }
  }

  return (
    <div className="page">
      <div className="container container-sm">
        <div className="page-header">
           <button className="btn btn-ghost" onClick={() => navigate('/teacher')} style={{ padding: '8px 0', marginBottom: 'var(--space-md)' }}>
            <ArrowLeft size={20} /> Thư viện
          </button>
          <h1 className="page-title">⚡ Tạo Game Hàng Loạt</h1>
          <p className="page-subtitle">Nhập câu hỏi 1 lần, tạo nhiều trò chơi tương ứng ngay lập tức.</p>
        </div>

        <div className="grid gap-xl">
          {/* 1. Thiết lập chung */}
          <div className="card">
            <h3 className="mb-md">Bước 1: Thông tin bộ câu hỏi</h3>
            <div className="grid gap-md">
              <input className="input input-lg" placeholder="Tên bài học (VD: Ôn tập Chương 1...)" value={title} onChange={e => setTitle(e.target.value)} />
              <textarea className="input" placeholder="Mô tả bài học..." value={description} onChange={e => setDescription(e.target.value)} rows={1} />
            </div>
          </div>

          {/* 2. Nhập liệu */}
          <div className="card" style={{ background: 'var(--color-primary-glow)', borderColor: 'var(--color-primary)' }}>
            <h3 className="mb-md flex items-center gap-sm" style={{ color: 'var(--color-primary-light)' }}>
              <Sparkles size={20} /> Bước 2: Nhập nội dung
            </h3>
            <div className="flex gap-sm">
              <input className="input" placeholder="Dùng AI: Nhập chủ đề..." style={{ flex: 1 }} value={aiTopic} onChange={e => setAiTopic(e.target.value)} />
              <button className="btn btn-primary" onClick={handleGenerateAI} disabled={generating || !aiTopic.trim()}>
                {generating ? 'Đang tạo...' : 'AI Tạo'}
              </button>
              <button className="btn btn-secondary" onClick={() => { setShowBankModal(true); fetchBankQuestions(); }}>
                Ngân hàng LMS
              </button>
            </div>
            {aiError && <p className="text-danger mt-sm">{aiError}</p>}
            
            <div className="mt-md pt-md" style={{ borderTop: '1px solid var(--border-color)' }}>
               <div className="flex flex-between items-center mb-md">
                 <strong>Danh sách câu hỏi ({questions.length})</strong>
                 <button className="btn btn-ghost btn-sm" onClick={() => setQuestions(prev => [...prev, { content: '', type: 'multiple-choice', answers: ['', '', '', ''], correct_index: 0 }])}>
                   <Plus size={16} /> Thêm tay
                 </button>
               </div>
               <div className="grid gap-sm" style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }}>
                 {questions.map((q, i) => (
                   <div key={i} className="flex flex-between items-center p-sm bg-surface" style={{ borderRadius: 'var(--radius-sm)' }}>
                     <span className="text-truncate" style={{ maxWidth: '80%' }}><b>{i + 1}.</b> {q.content || '...'}</span>
                     <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setQuestions(prev => prev.filter((_, idx) => idx !== i))}>
                       <Trash2 size={16} />
                     </button>
                   </div>
                 ))}
                 {questions.length === 0 && <p className="text-muted text-center py-md">Chưa có câu hỏi nào</p>}
               </div>
            </div>
          </div>

          {/* 3. Chọn Game */}
          <div className="card">
            <h3 className="mb-md">Bước 3: Chọn các trò chơi muốn tạo</h3>
            <div className="grid grid-3 gap-md">
              {GAME_REGISTRY.map(game => (
                <div 
                  key={game.type} 
                  className={`card pointer hover-scale ${selectedTypes.has(game.type) ? 'selected' : ''}`}
                  onClick={() => toggleType(game.type)}
                  style={{ 
                    padding: 'var(--space-md)', 
                    borderColor: selectedTypes.has(game.type) ? 'var(--color-primary)' : 'var(--border-color)',
                    background: selectedTypes.has(game.type) ? 'var(--color-primary-glow)' : 'transparent'
                  }}
                >
                  <div className="flex flex-between items-center">
                    <span style={{ fontSize: '1.5rem' }}>{game.icon}</span>
                    {selectedTypes.has(game.type) ? <CheckSquare size={18} color="var(--color-primary)" /> : <Square size={18} color="var(--border-color)" />}
                  </div>
                  <div style={{ marginTop: '8px', fontWeight: 600, fontSize: '0.9rem' }}>{game.name}</div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="btn btn-primary btn-lg w-full" 
            style={{ padding: 'var(--space-lg)' }}
            disabled={saving || questions.length === 0 || selectedTypes.size === 0 || !title.trim()}
            onClick={handleBulkSave}
          >
            {saving ? 'Đang tạo hàng loạt...' : `🚀 Lưu & Tạo ${selectedTypes.size} Trò Chơi Ngay`}
          </button>
        </div>
      </div>

      {/* Modal Import Bank */}
      {showBankModal && (
        <div className="modal-overlay flex-center" style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', padding: 'var(--space-xl)' }}>
           <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
              <div className="flex flex-between mb-xl">
                 <h2 style={{ margin: 0 }}>Ngân hàng LMS</h2>
                 <button className="btn btn-ghost" onClick={() => setShowBankModal(false)}>&times;</button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                 {loadingBank ? <div className="loader mx-auto"></div> : (
                   <div className="grid gap-sm">
                      {bankQuestions.map(q => (
                        <label key={q.id} className="card flex items-center gap-md pointer" style={{ borderColor: selectedBankIds.has(q.id) ? 'var(--color-primary)' : 'var(--border-color)' }}>
                           <input type="checkbox" checked={selectedBankIds.has(q.id)} onChange={e => {
                             const n = new Set(selectedBankIds); e.target.checked ? n.add(q.id) : n.delete(q.id); setSelectedBankIds(n);
                           }} />
                           <div style={{ flex: 1 }}><b>{q.content}</b><div className="text-muted small">{q.subject} - {q.topic}</div></div>
                        </label>
                      ))}
                   </div>
                 )}
              </div>
              <div className="flex gap-sm mt-xl" style={{ justifyContent: 'flex-end' }}>
                 <button className="btn btn-primary" onClick={() => {
                   const sel = bankQuestions.filter(q => selectedBankIds.has(q.id)).map(q => ({
                     content: q.content, answers: q.answers || q.options || [], correct_index: q.correct_index ?? 0, type: q.type || 'multiple-choice'
                   }));
                   setQuestions(prev => [...prev, ...sel]);
                   setShowBankModal(false);
                 }}>Nhập {selectedBankIds.size} câu</button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
