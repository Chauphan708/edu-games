import { create } from 'zustand'
import type { Room, Participant, Game, GameType, GameGroup } from '../types/supabase'

interface GameStore {
  // Current session state
  currentRoom: Room | null
  currentGame: Game | null
  currentParticipant: Participant | null
  participants: Participant[]

  // UI state
  view: 'home' | 'teacher-dashboard' | 'game-library' | 'game-creator' | 'live-session' | 'settings' | 'reports' | 'join-room' | 'lobby' | 'playing' | 'results'

  // Actions
  setCurrentRoom: (room: Room | null) => void
  setCurrentGame: (game: Game | null) => void
  setCurrentParticipant: (participant: Participant | null) => void
  setParticipants: (participants: Participant[]) => void
  addParticipant: (participant: Participant) => void
  updateParticipant: (id: string, updates: Partial<Participant>) => void
  removeParticipant: (id: string) => void
  setView: (view: GameStore['view']) => void
  reset: () => void
}

const initialState = {
  currentRoom: null,
  currentGame: null,
  currentParticipant: null,
  participants: [],
  view: 'home' as const,
}

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setCurrentRoom: (room) => set({ currentRoom: room }),
  setCurrentGame: (game) => set({ currentGame: game }),
  setCurrentParticipant: (participant) => set({ currentParticipant: participant }),
  setParticipants: (participants) => set({ participants }),

  addParticipant: (participant) =>
    set((state) => ({
      participants: [...state.participants.filter(p => p.id !== participant.id), participant],
    })),

  updateParticipant: (id, updates) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  removeParticipant: (id) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== id),
    })),

  setView: (view) => set({ view }),

  reset: () => set(initialState),
}))

// ═══════════════════════════════════════
// Game Registry — danh sách 23 game
// ═══════════════════════════════════════

export interface GameRegistryItem {
  type: GameType
  name: string
  icon: string
  group: GameGroup
  groupLabel: string
  description: string
  realtimeFeature: string
}

export const GAME_REGISTRY: GameRegistryItem[] = [
  // Quiz (5)
  { type: 'speed-quiz', name: 'Trắc Nghiệm Nhanh', icon: '⚡', group: 'quiz', groupLabel: 'Trắc Nghiệm', description: 'Câu hỏi 4 đáp án, đếm ngược, điểm theo tốc độ', realtimeFeature: 'GV thấy % đúng/sai ngay' },
  { type: 'quiz-race', name: 'Chạy Đua Kiến Thức', icon: '🏁', group: 'quiz', groupLabel: 'Trắc Nghiệm', description: 'Bấm buzzer giành quyền trả lời', realtimeFeature: 'Buzzer race condition' },
  { type: 'bomb-quiz', name: 'Gỡ Bom Kiến Thức', icon: '💣', group: 'quiz', groupLabel: 'Trắc Nghiệm', description: 'Bom đếm ngược, trả lời trước khi nổ', realtimeFeature: 'Countdown đồng bộ tất cả' },
  { type: 'brick-breaker', name: 'Xếp Gạch Kiến Thức', icon: '🧱', group: 'quiz', groupLabel: 'Trắc Nghiệm', description: 'Brick Breaker + câu hỏi khi phá gạch', realtimeFeature: 'Score real-time' },
  { type: 'true-false', name: 'Đúng Sai Siêu Tốc', icon: '✅', group: 'quiz', groupLabel: 'Trắc Nghiệm', description: 'Bấm đúng/sai thật nhanh', realtimeFeature: 'Tỉ lệ đúng/sai toàn lớp' },

  // Vocabulary (6)
  { type: 'memory-match', name: 'Lật Thẻ Ghi Nhớ', icon: '🃏', group: 'vocabulary', groupLabel: 'Từ Vựng', description: 'Memory match cặp từ-nghĩa', realtimeFeature: 'Leaderboard theo thời gian' },
  { type: 'matching-wires', name: 'Ghép Cặp Nối Dây', icon: '🔗', group: 'vocabulary', groupLabel: 'Từ Vựng', description: 'Kéo dây nối 2 cột', realtimeFeature: 'Ai xong trước' },
  { type: 'word-scramble', name: 'Giải Mã Từ Vựng', icon: '🔤', group: 'vocabulary', groupLabel: 'Từ Vựng', description: 'Sắp xếp chữ cái xáo trộn', realtimeFeature: 'Race hoàn thành tất cả từ' },
  { type: 'crossword', name: 'Ô Chữ', icon: '📋', group: 'vocabulary', groupLabel: 'Từ Vựng', description: 'Crossword đồng hồ đếm ngược', realtimeFeature: 'Progress từng ô' },
  { type: 'bingo', name: 'Bingo Kiến Thức', icon: '🎯', group: 'vocabulary', groupLabel: 'Từ Vựng', description: 'GV hô keyword, HS đánh dấu', realtimeFeature: 'GV broadcast keyword' },
  { type: 'drag-classify', name: 'Kéo Thả Phân Loại', icon: '📦', group: 'vocabulary', groupLabel: 'Từ Vựng', description: 'Kéo thả vào đúng nhóm', realtimeFeature: '% đúng theo nhóm' },

  // Strategy (4)
  { type: 'sort-order', name: 'Sắp Xếp Thứ Tự', icon: '🔢', group: 'strategy', groupLabel: 'Chiến Thuật', description: 'Kéo thả sắp xếp theo thứ tự', realtimeFeature: 'Race ai xong trước' },
  { type: 'treasure-hunt', name: 'Truy Tìm Kho Báu', icon: '🗺️', group: 'strategy', groupLabel: 'Chiến Thuật', description: 'Giải chuỗi câu hỏi để tìm kho báu', realtimeFeature: 'GV thấy mỗi HS ở bước nào' },
  { type: 'snakes-ladders', name: 'Rắn & Thang', icon: '🐍', group: 'strategy', groupLabel: 'Chiến Thuật', description: 'Cờ bàn + câu hỏi theo lượt', realtimeFeature: 'GV điều khiển lượt' },
  { type: 'countdown-challenge', name: 'Đếm Ngược Thách Thức', icon: '⏳', group: 'strategy', groupLabel: 'Chiến Thuật', description: 'Level 1→5 khó dần, lifeline 50/50', realtimeFeature: 'GV thấy level và mạng' },

  // Creative (4)
  { type: 'wheel-spin', name: 'Vòng Quay May Mắn', icon: '🎡', group: 'creative', groupLabel: 'Sáng Tạo', description: 'GV spin → chọn ngẫu nhiên', realtimeFeature: 'Tất cả thấy vòng quay' },
  { type: 'mystery-box', name: 'Hộp Quà Bí Mật', icon: '🎁', group: 'creative', groupLabel: 'Sáng Tạo', description: 'Chọn hộp ẩn câu hỏi/thưởng', realtimeFeature: 'Toàn lớp thấy cùng lúc' },
  { type: 'reveal-puzzle', name: 'Lật Ô Bí Mật', icon: '🧩', group: 'creative', groupLabel: 'Sáng Tạo', description: 'Trả lời → lật ô → đoán hình ẩn', realtimeFeature: 'Ô lật đồng bộ' },
  { type: 'blur-image', name: 'Đoán Tranh Mờ', icon: '🖼️', group: 'creative', groupLabel: 'Sáng Tạo', description: 'Hình blur dần rõ, gõ đoán', realtimeFeature: 'Race submit' },

  // Team (4)
  { type: 'relay-quiz', name: 'Tiếp Sức Kiến Thức', icon: '🏃', group: 'team', groupLabel: 'Đội Nhóm', description: 'Các thành viên trả lời luân phiên', realtimeFeature: 'Lượt tự chuyển' },
  { type: 'jeopardy', name: 'Chọn Ô Điểm Số', icon: '🏆', group: 'team', groupLabel: 'Đội Nhóm', description: 'Jeopardy: chọn ô và trả lời', realtimeFeature: 'Đội biểu quyết chọn ô' },
  { type: 'battle-quiz', name: 'Đấu Đội Cướp Quyền', icon: '⚔️', group: 'team', groupLabel: 'Đội Nhóm', description: 'Buzzer → trả lời → đội khác cướp', realtimeFeature: 'Race + steal 10s' },
  { type: 'boat-race', name: 'Đua Thuyền Kiến Thức', icon: '🚣', group: 'team', groupLabel: 'Đội Nhóm', description: 'Đúng câu hỏi → thuyền đội tiến', realtimeFeature: 'Thuyền di chuyển real-time' },
]

export const GROUP_COLORS: Record<GameGroup, string> = {
  quiz: 'var(--group-quiz)',
  vocabulary: 'var(--group-vocabulary)',
  strategy: 'var(--group-strategy)',
  creative: 'var(--group-creative)',
  team: 'var(--group-team)',
}

export const GROUP_LABELS: Record<GameGroup, string> = {
  quiz: '🔴 Trắc Nghiệm',
  vocabulary: '🟢 Từ Vựng',
  strategy: '🟣 Chiến Thuật',
  creative: '🟡 Sáng Tạo',
  team: '🩷 Đội Nhóm',
}
