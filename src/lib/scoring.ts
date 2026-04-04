/**
 * Scoring System
 * Calculate points based on speed, accuracy, and streaks
 */

const BASE_POINTS = 1000
const SPEED_BONUS_MAX = 500
const STREAK_MULTIPLIER = 0.1 // 10% bonus per streak level

/**
 * Calculate points for a correct answer
 * @param responseTimeMs - Time taken to answer in milliseconds
 * @param timeLimitMs - Total time allowed in milliseconds
 * @param currentStreak - Current streak count
 * @returns Points earned
 */
export function calculatePoints(
  responseTimeMs: number,
  timeLimitMs: number,
  currentStreak: number
): number {
  // Base points for correct answer
  let points = BASE_POINTS

  // Speed bonus: faster = more points (linear decay)
  const timeRatio = Math.max(0, 1 - responseTimeMs / timeLimitMs)
  const speedBonus = Math.round(SPEED_BONUS_MAX * timeRatio)
  points += speedBonus

  // Streak bonus: 10% per streak level, max 50%
  const streakMultiplier = 1 + Math.min(currentStreak, 5) * STREAK_MULTIPLIER
  points = Math.round(points * streakMultiplier)

  return points
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
