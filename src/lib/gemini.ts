/**
 * Gemini 2.0 Flash API Wrapper
 * GV nhập key riêng trong Settings → lưu trong teacher_settings
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>
    }
  }>
}

/**
 * Call Gemini API to generate questions
 */
export async function generateQuestions(
  apiKey: string,
  prompt: string
): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    if (response.status === 400) {
      throw new Error('API Key không hợp lệ. Vui lòng kiểm tra lại trong Cài đặt.')
    }
    if (response.status === 429) {
      throw new Error('Đã vượt quá giới hạn API. Vui lòng thử lại sau.')
    }
    throw new Error(`Lỗi Gemini API: ${(error as Record<string, unknown>).message || response.statusText}`)
  }

  const data: GeminiResponse = await response.json()
  return data.candidates[0]?.content?.parts[0]?.text || ''
}

/**
 * Mới: Gọi Gemini và tự động parse JSON kết quả
 */
export async function generateGameContent(
  apiKey: string,
  prompt: string
): Promise<any> {
  const text = await generateQuestions(apiKey, prompt)
  try {
    // Làm sạch chuỗi nếu AI trả về kèm markdown ```json
    const cleanJson = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleanJson)
    return { questions: Array.isArray(parsed) ? parsed : (parsed.questions || []) }
  } catch (err) {
    console.error('Lỗi phân tích JSON từ AI:', err, text)
    throw new Error('AI trả về dữ liệu không đúng định dạng JSON. Vui lòng thử lại.')
  }
}

/**
 * Build prompt for quiz-type questions
 */
export function buildQuizPrompt(
  topic: string,
  count: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): string {
  return `Bạn là một giáo viên giỏi. Hãy tạo ${count} câu hỏi trắc nghiệm về chủ đề "${topic}" với độ khó "${difficulty}".

Trả về JSON array với format sau:
[
  {
    "content": "Câu hỏi?",
    "type": "multiple-choice",
    "answers": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "correct_index": 0,
    "explanation": "Giải thích ngắn gọn"
  }
]

Quy tắc:
- correct_index là index (0-3) của đáp án đúng
- Mỗi câu hỏi phải có 4 lựa chọn
- Câu hỏi phải rõ ràng, chính xác
- Dùng tiếng Việt
- Chỉ trả về JSON, không giải thích thêm`
}

/**
 * Build prompt for true/false questions
 */
export function buildTrueFalsePrompt(
  topic: string,
  count: number
): string {
  return `Tạo ${count} câu hỏi Đúng/Sai về chủ đề "${topic}".

Trả về JSON array:
[
  {
    "content": "Phát biểu cần đánh giá",
    "type": "true-false",
    "answers": ["Đúng", "Sai"],
    "correct_index": 0,
    "explanation": "Giải thích"
  }
]

- correct_index: 0 = Đúng, 1 = Sai
- Dùng tiếng Việt
- Chỉ trả về JSON`
}

/**
 * Build prompt for vocabulary matching
 */
export function buildVocabularyPrompt(
  topic: string,
  count: number
): string {
  return `Tạo ${count} cặp từ vựng/khái niệm về chủ đề "${topic}" để dùng trong game nối cặp.

Trả về JSON array:
[
  {
    "content": "Từ/Thuật ngữ",
    "type": "matching",
    "answers": ["Định nghĩa đúng", "Định nghĩa sai 1", "Định nghĩa sai 2", "Định nghĩa sai 3"],
    "correct_index": 0,
    "explanation": "Giải thích thêm"
  }
]

- Dùng tiếng Việt
- Chỉ trả về JSON`
}

/**
 * Validate API key by making a small test request
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Trả lời "OK"' }] }],
        generationConfig: { maxOutputTokens: 10 },
      }),
    })
    return response.ok
  } catch {
    return false
  }
}
