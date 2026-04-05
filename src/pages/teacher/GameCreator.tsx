import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Plus, Trash2, Sparkles, Play } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { GAME_REGISTRY } from '../../store/gameStore'
import { buildQuizPrompt, generateGameContent } from '../../lib/gemini'
import type { Question, GameType, GameGroup } from '../../types/supabase'

export default function GameCreator() {
  const { gameType } = useParams<{ gameType: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading, geminiApiKey: storeGeminiKey } = useAuth()
  
  // Game Info trích xuất từ Registry
  const gameInfo = GAME_REGISTRY.find(g => g.type === gameType)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  
  // AI State
  const [aiTopic, setAiTopic] = useState('')
  const [aiCount, setAiCount] = useState(5)
  const [generating, setGenerating] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [geminiKey, setGeminiKey] = useState<string | null>(storeGeminiKey)
  
  // Game State
  const [saving, setSaving] = useState(false)
  
  // Bank Import State
  const [showBankModal, setShowBankModal] = useState(false)
  const [bankQuestions, setBankQuestions] = useState<any[]>([])
  const [selectedBankIds, setSelectedBankIds] = useState<Set<string>>(new Set())
  const [loadingBank, setLoadingBank] = useState(false)

  // Tự động cập nhật geminiKey khi store thay đổi
  useEffect(() => {
    if (storeGeminiKey) {
      setGeminiKey(storeGeminiKey)
    } else if (user?.id) {
       // Fallback: Tìm trong DB nếu trong store chưa có (ví dụ vào trực tiếp ko qua SSO)
       supabase
         .from('teacher_settings')
         .select('gemini_api_key')
         .eq('user_id', user.id)
         .single()
         .then(({ data }) => {
            if (data) setGeminiKey((data as any).gemini_api_key)
         })
    }
  }, [user?.id, storeGeminiKey])

  if (authLoading) {
    return (
      <div className="page flex flex-center">
        <div className="loader"></div>
      </div>
    )
  }

  if (!gameInfo) return <div className="page flex flex-center">Game không tồn tại</div>

  // --- ACTIONS ---
  
  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return
    if (!geminiKey) {
       setAiError('Vui lòng cài đặt Gemini API Key trong phần Cài đặt của bạn.')
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
      } else {
        throw new Error('Định dạng AI trả về không hợp lệ')
      }
    } catch (err: any) {
      setAiError(err.message || 'Lỗi khi kết nối với AI')
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveGame = async () => {
    if (!title.trim() || questions.length === 0 || !user) return
    
    setSaving(true)
    try {
      const gameData: any = {
        teacher_id: user.id,
        title,
        description,
        game_type: gameType as GameType,
        group_name: gameInfo.group as GameGroup,
        questions,
        settings: {},
        is_public: false
      }

      const { data, error } = await supabase
        .from('games')
        .insert(gameData)
        .select()
        .single()

      if (error) throw error
      alert('Đã lưu trò chơi thành công!')
      navigate('/teacher')
      return data
    } catch (err) {
      console.error(err)
      alert('Lỗi khi lưu trò chơi')
    } finally {
      setSaving(false)
    }
  }

  const addEmptyQuestion = () => {
    setQuestions(prev => [...prev, {
      content: '',
      type: 'multiple-choice',
      answers: ['', '', '', ''],
      correct_index: 0
    }])
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
      console.error(err)
      alert('Không thể lấy dữ liệu từ Ngân hàng')
    } finally {
      setLoadingBank(false)
    }
  }

  const handleImportSelected = () => {
    const selected = bankQuestions.filter(q => selectedBankIds.has(q.id))
    const mapped = selected.map(q => ({
      id: q.id,
      content: q.content,
      type: q.type || 'multiple-choice',
      answers: q.answers || q.options || [],
      correct_index: q.correct_index ?? q.correct_option_index ?? 0,
      imageUrl: q.image_url,
      difficulty: q.difficulty,
      subject: q.subject,
      topic: q.topic
    })) as Question[]
    
    setQuestions(prev => [...prev, ...mapped])
    setShowBankModal(false)
    setSelectedBankIds(new Set())
    alert(`Đã nhập thành công ${mapped.length} câu hỏi!`)
  }

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="page">
      <div className="container container-sm">
         {/* Header */}
         <div className="page-header">
           <button className="btn btn-ghost" onClick={() => navigate('/teacher')} style={{ padding: '8px 0', marginBottom: 'var(--space-md)' }}>
            <ArrowLeft size={20} /> Thư viện
          </button>
          
          <div className="flex" style={{ gap: 'var(--space-sm)', alignItems: 'center' }}>
             <span style={{ fontSize: '2rem' }}>{gameInfo.icon}</span>
             <div>
                <h1 className="page-title" style={{ fontSize: 'var(--text-2xl)', marginBottom: 0 }}>Tạo {gameInfo.name}</h1>
                <p className="page-subtitle" style={{ marginTop: 0 }}>{gameInfo.description}</p>
             </div>
          </div>
        </div>

        <div className="grid gap-xl">
          {/* Thông tin cơ bản */}
          <div className="card">
            <h3 style={{ marginBottom: 'var(--space-md)' }}>Thông tin Game</h3>
            <div className="grid gap-md">
              <input 
                className="input input-lg" 
                placeholder="Nhập tên bài học..." 
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ textAlign: 'left', letterSpacing: 'normal' }}
              />
              <textarea 
                className="input" 
                placeholder="Mô tả ngắn gọn (Không bắt buộc)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Công cụ AI */}
          <div className="card" style={{ background: 'var(--color-primary-glow)', borderColor: 'var(--color-primary)' }}>
            <h3 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-light)' }}>
              <Sparkles size={20} /> AI Tạo Câu Hỏi
            </h3>
            
            {aiError && <div style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-sm)' }}>{aiError}</div>}
            
            <div className="flex gap-sm">
              <input 
                className="input" 
                placeholder="VD: Định luật Newton, Phân giải Phương trình..." 
                style={{ flex: 1 }}
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
              />
              <input 
                type="number" 
                className="input" 
                style={{ width: 80 }} 
                value={aiCount}
                onChange={e => setAiCount(Number(e.target.value))}
                min={1} max={20}
              />
              <button 
                className="btn btn-primary" 
                onClick={handleGenerateAI}
                disabled={generating || !aiTopic.trim()}
              >
                {generating ? 'Đang tạo...' : 'Tạo'}
              </button>
            </div>
            
            <div className="mt-md" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-md)' }}>
              <button 
                className="btn btn-secondary w-full"
                onClick={() => {
                  setShowBankModal(true)
                  fetchBankQuestions()
                }}
              >
                📥 Lấy từ Ngân hàng LMS
              </button>
            </div>
          </div>

          {/* Danh sách câu hỏi */}
          <div>
            <div className="flex flex-between" style={{ marginBottom: 'var(--space-md)' }}>
              <h3>Câu hỏi ({questions.length})</h3>
              <button className="btn btn-secondary btn-sm" onClick={addEmptyQuestion}>
                <Plus size={16} /> Thêm thủ công
              </button>
            </div>

            <div className="grid gap-md">
              {questions.map((q, idx) => (
                 <div key={idx} className="card" style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <div style={{ flex: 1 }}>
                      <strong>Câu {idx + 1}:</strong> {q.content}
                      <ul style={{ marginTop: '8px', color: 'var(--text-secondary)', paddingLeft: '20px' }}>
                        {q.answers?.map((opt: string, oIdx: number) => (
                          <li key={oIdx} style={{ color: Number(oIdx) === Number(q.correct_index as any) ? 'var(--color-success)' : 'inherit' }}>
                            {opt} {Number(oIdx) === Number(q.correct_index as any) && '✓'}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={() => removeQuestion(idx)} style={{ color: 'var(--color-danger)' }}>
                      <Trash2 size={20} />
                    </button>
                 </div>
              ))}
              
              {questions.length === 0 && (
                <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                  Chưa có câu hỏi nào. Hãy dùng AI để tạo!
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex gap-sm" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
             <button 
               className="btn btn-primary btn-lg" 
               disabled={saving || generating || questions.length === 0 || !title.trim()}
               onClick={handleSaveGame}
             >
                {saving ? 'Đang lưu...' : (
                  <>
                    <Save size={20} /> Lưu Game
                  </>
                )}
             </button>
             
             <button 
                className="btn btn-success btn-lg" 
                disabled={saving || generating || questions.length === 0 || !title.trim()}
                onClick={async () => {
                   await handleSaveGame()
                }}
             >
                <Play size={20} /> Tạo & Chơi Ngay
             </button>
          </div>

        </div>
      </div>
      
      {/* Modal Ngân hàng câu hỏi */}
      {showBankModal && (
        <div className="modal-overlay flex-center" style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', padding: 'var(--space-xl)' }}>
           <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
              <div className="flex flex-between mb-xl">
                 <h2 style={{ margin: 0 }}>Ngân hàng câu hỏi LMS</h2>
                 <button className="btn btn-ghost" onClick={() => setShowBankModal(false)}>&times; Đóng</button>
              </div>
              
              {loadingBank ? (
                <div className="flex-center p-2xl"><div className="loader"></div></div>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: 'var(--space-xl)' }}>
                   {bankQuestions.length === 0 ? (
                      <div className="text-center p-2xl">Ngân hàng chưa có câu hỏi nào</div>
                   ) : (
                      <div className="grid gap-sm">
                         {bankQuestions.map((q) => (
                            <label key={q.id} className="card flex items-center gap-md" style={{ cursor: 'pointer', borderColor: selectedBankIds.has(q.id) ? 'var(--color-primary)' : 'var(--border-color)' }}>
                               <input 
                                 type="checkbox" 
                                 checked={selectedBankIds.has(q.id)}
                                 onChange={(e) => {
                                    const next = new Set(selectedBankIds)
                                    if (e.target.checked) next.add(q.id)
                                    else next.delete(q.id)
                                    setSelectedBankIds(next)
                                 }}
                               />
                               <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600 }}>{q.content}</div>
                                  <div className="text-muted" style={{ fontSize: '12px' }}>{q.subject} - {q.topic}</div>
                                </div>
                            </label>
                         ))}
                      </div>
                   )}
                </div>
              )}
              
              <div className="flex gap-sm" style={{ justifyContent: 'flex-end' }}>
                 <button className="btn btn-ghost" onClick={() => {
                    const allIds = bankQuestions.map(q => q.id)
                    setSelectedBankIds(new Set(allIds))
                 }}>Chọn tất cả</button>
                 
                 <button 
                    className="btn btn-primary" 
                    disabled={selectedBankIds.size === 0}
                    onClick={handleImportSelected}
                 >
                    Nhập {selectedBankIds.size} câu đã chọn
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
