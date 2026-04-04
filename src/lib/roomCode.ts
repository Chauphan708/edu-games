/**
 * Room Code Utilities
 * Generate and validate 6-character room codes
 * Characters: A-Z (no O, I) + 2-9 (no 0, 1) to avoid confusion
 */

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateRoomCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}

export function isValidRoomCode(code: string): boolean {
  if (code.length !== 6) return false
  return /^[A-HJ-NP-Z2-9]{6}$/.test(code.toUpperCase())
}

export function formatRoomCode(code: string): string {
  return code.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '').slice(0, 6)
}
