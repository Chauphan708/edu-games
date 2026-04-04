import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, Save, Play, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { generateQuestions, buildQuizPrompt } from '../../lib/gemini'
import { useAuth } from '../../hooks/useAuth'
import { GAME_REGISTRY } from '../../store/gameStore'
import type { Question, Game } from '../../types/supabase'

export default function GameCreator() {
  const { gameType } = useParams<{ gameType: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const gameInfo = GAME_REGISTRY.find(g => g.type === gameType)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  
  // AI State
  const [aiTopic, setAiTopic] = useState('')
  const [aiCount, setAiCount] = useState(5)
  const [generating, setGenerating] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  
  // Game State
  const [saving, setSaving] = useState(false)

  if (!gameInfo) return <div className="page flex flex-center">Game không tồn tại</div>

  // Xử lý tạo câu hỏi bằng AI
  const handleGenerateAI = async () => {
    if (!user?.id || !aiTopic.trim()) return
    setGenerating(true)
    setAiError(null)

    try {
      // 1. Lấy API key từ teacher_settings
      const { data: settings } = await (supabase
        .from('teacher_settings')
        .select('gemini_api_key')
        .eq('user_id', user.id)
        .single() as any)

      if (!settings?.gemini_api_key) {
        throw new Error('Chưa cài đặt Gemini API Key. Vui lòng vào Cài đặt để thêm key.')
      }

      // 2. Build prompt dựa theo loại game (Mặc định tạm dùng Quiz prompt)
      // Tương lai có thể map prompt theo group: quiz, vocabulary...
      const prompt = buildQuizPrompt(aiTopic, aiCount)
      
      // 3. Gọi Gemini
      const responseText = await generateQuestions(settings.gemini_api_key, prompt)
      
      // 4. Parse JSON (Gemini đôi khi bọc json trong markdown block ```json ... ```)
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
      const newQuestions: Question[] = JSON.parse(cleanJson)

      setQuestions(prev => [...prev, ...newQuestions])

    } catch (err: any) {
      console.error(err)
      setAiError(err.message || 'Lỗi khi tạo câu hỏi. Vui lòng thử lại.')
    } finally {
      setGenerating(false)
    }
  }

  // Lưu Game
  const handleSaveGame = async () => {
    if (!user?.id || !title.trim() || questions.length === 0) return
    setSaving(true)

    try {
      const { data, error } = await supabase.from('games').insert({
        teacher_id: user.id,
        title,
        description,
        game_type: gameInfo.type,
        group_name: gameInfo.group,
        questions,
      }).select().single()

      if (error) throw error

      navigate('/teacher') // Quay lại thư viện
    } catch (err) {
      console.error(err)
      alert('Lỗi lưu game')
    } finally {
      setSaving(false)
    }
  }

  // Thêm một câu trống
  const addEmptyQuestion = () => {
    setQuestions(prev => [...prev, {
      text: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0
    }])
  }

  // Xóa câu
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
                      <strong>Câu {idx + 1}:</strong> {q.text}
                      {/* Đơn giản hóa hiển thị: Tương lai sẽ làm form edit chi tiết */}
                      <ul style={{ marginTop: '8px', color: 'var(--text-secondary)', paddingLeft: '20px' }}>
                        {q.options?.map((opt, oIdx) => (
                          <li key={oIdx} style={{ color: oIdx === q.correctAnswer ? 'var(--color-success)' : 'inherit' }}>
                            {opt} {oIdx === q.correctAnswer && '✓'}
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
          <div className="flex gap-sm" style={{ justifyContent: 'flex-end' }}>
             <button 
               className="btn btn-primary btn-lg" 
               disabled={saving || questions.length === 0 || !title.trim()}
               onClick={handleSaveGame}
             >
                <Save size={20} /> Lưu Game
             </button>
             {/* Start Live button will be here, navigating to Room Creation logic */}
             <button className="btn btn-success btn-lg" disabled={questions.length === 0 || !title.trim()}>
                <Play size={20} /> Tạo & Chơi Ngay
             </button>
          </div>

        </div>
      </div>
    </div>
  )
}
