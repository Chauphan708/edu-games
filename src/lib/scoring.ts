/**
 * Scoring System
 * Calculate points based on speed, accuracy, and streaks
 */


/**
 * Calculate points for a correct answer based on new Cumulative rules.
 * @param isCorrect - Whether the answer was correct
 * @param difficultyLevel - 1 (Nhận biết), 2 (Kết nối), 3 (Vận dụng)
 * @returns Points earned
 */
export function calculatePoints(
  isCorrect: boolean,
  difficultyLevel: number = 1
): number {
  if (!isCorrect) return 0
  
  // Đảm bảo mức độ hợp lệ từ 1 đến 3
  const level = Math.max(1, Math.min(3, difficultyLevel || 1))
  
  // Đúng cơ bản được 1 điểm x hệ số mức độ
  return 1 * level
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

/**
 * Format time display
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  return `${secs}s`
}

/**
 * Format score with comma separators
 */
export function formatScore(score: number): string {
  return score.toLocaleString()
}
