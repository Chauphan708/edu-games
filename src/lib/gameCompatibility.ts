import type { GameType, GameGroup } from '../types/supabase'

export interface GameMetadata {
  type: GameType
  name: string
  icon: string
  group: GameGroup
  description: string
  requiredFormat: 'multiple-choice' | 'pairs' | 'classify' | 'single-word' | 'any'
}

export const GAME_LIBRARY: GameMetadata[] = [
  // Nhóm Quiz
  { type: 'speed-quiz', name: '⚡ Trắc nghiệm Tốc độ', icon: 'zap', group: 'quiz', requiredFormat: 'multiple-choice', description: 'Chọn nhanh đáp án đúng trong thời gian ngắn.' },
  { type: 'true-false', name: '✅ Đúng hay Sai', icon: 'check-circle', group: 'quiz', requiredFormat: 'multiple-choice', description: 'Chỉ có 2 lựa chọn: Đúng hoặc Sai.' },
  { type: 'bomb-quiz', name: '💣 Quả Bom Nổ Chậm', icon: 'bomb', group: 'quiz', requiredFormat: 'multiple-choice', description: 'Trả lời đúng để dập ngòi nổ trước khi bùm!' },
  
  // Nhóm Vocabulary
  { type: 'memory-match', name: '🃏 Lật Thẻ Ghi Nhớ', icon: 'layers', group: 'vocabulary', requiredFormat: 'pairs', description: 'Tìm các cặp thẻ tương ứng (Từ - Nghĩa).' },
  { type: 'matching-wires', name: '🔗 Ghép Cặp Nối Dây', icon: 'link', group: 'vocabulary', requiredFormat: 'pairs', description: 'Nối các từ ở 2 cột lại với nhau.' },
  { type: 'word-scramble', name: '🔤 Giải Mã Từ Vựng', icon: 'type', group: 'vocabulary', requiredFormat: 'single-word', description: 'Sắp xếp các chữ cái để tạo thành từ đúng.' },
  { type: 'drag-classify', name: '📦 Kéo Thả Phân Loại', icon: 'package', group: 'vocabulary', requiredFormat: 'classify', description: 'Phân loại các từ vào đúng nhóm của chúng.' },
  { type: 'bingo', name: '🎯 Bingo Kiến Thức', icon: 'target', group: 'vocabulary', requiredFormat: 'single-word', description: 'Lắng nghe từ khóa và đánh dấu vào bảng Bingo.' },
  
  // Nhóm Strategy/Creative/Team (Thường nhận định dạng Any)
  { type: 'mystery-box', name: '🎁 Hộp Quà Bí Ẩn', icon: 'gift', group: 'creative', requiredFormat: 'any', description: 'May rủi chọn hộp quà để nhận/mất điểm.' },
  { type: 'boat-race', name: '🚣 Đua Thuyền Tiếp Sức', icon: 'ship', group: 'team', requiredFormat: 'multiple-choice', description: 'Đua thuyền giữa các đội bằng cách trả lời trắc nghiệm.' },
]

/**
 * Hàm kiểm tra bộ câu hỏi của GV phù hợp với những Game nào
 */
export function getCompatibleGames(questions: any[]): GameMetadata[] {
  if (!questions || questions.length === 0) return []

  return GAME_LIBRARY.filter(game => {
    // 1. Kiểm tra Trắc nghiệm (Phải có options)
    if (game.requiredFormat === 'multiple-choice') {
      return questions.every(q => q.options && q.options.length >= 2)
    }
    
    // 2. Kiểm tra Cặp (Phải có word - definition)
    if (game.requiredFormat === 'pairs') {
      return questions.every(q => q.word && q.definition)
    }
    
    // 3. Kiểm tra Phân loại (Phải có category)
    if (game.requiredFormat === 'classify') {
      return questions.every(q => q.category)
    }

    return true // Mac định Any
  })
}
