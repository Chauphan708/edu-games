import { lazy } from 'react'
import type { GameType } from '../types/supabase'
import type { BaseGameProps } from '../types/game'

// --- Quiz Games ---
const SpeedQuiz = lazy(() => import('./quiz/SpeedQuiz'))
const BombQuiz = lazy(() => import('./quiz/BombQuiz'))
const TrueFalse = lazy(() => import('./quiz/TrueFalse'))
const BrickBreaker = lazy(() => import('./quiz/BrickBreaker'))
const QuizRace = lazy(() => import('./quiz/QuizRace'))

// --- Vocabulary Games ---
const MemoryMatch = lazy(() => import('./vocabulary/MemoryMatch'))
const MatchingWires = lazy(() => import('./vocabulary/MatchingWires'))
const WordScramble = lazy(() => import('./vocabulary/WordScramble'))
const DragClassify = lazy(() => import('./vocabulary/DragClassify'))
const Bingo = lazy(() => import('./vocabulary/Bingo'))
const Crossword = lazy(() => import('./vocabulary/Crossword'))

// --- Strategy Games ---
const SortOrder = lazy(() => import('./strategy/SortOrder'))
const TreasureHunt = lazy(() => import('./strategy/TreasureHunt'))
const SnakesLadders = lazy(() => import('./strategy/SnakesLadders'))
const CountdownChallenge = lazy(() => import('./strategy/CountdownChallenge'))

// --- Creative & Luck Games ---
const WheelSpin = lazy(() => import('./creative/WheelSpin'))
const MysteryBox = lazy(() => import('./creative/MysteryBox'))
const RevealPuzzle = lazy(() => import('./creative/RevealPuzzle'))
const BlurImage = lazy(() => import('./creative/BlurImage'))

// --- Team/Battle Games ---
const RelayQuiz = lazy(() => import('./team/RelayQuiz'))
const Jeopardy = lazy(() => import('./team/Jeopardy'))
const BattleQuiz = lazy(() => import('./team/BattleQuiz'))
const BoatRace = lazy(() => import('./team/BoatRace'))

// Các game khác sẽ thêm dần vào đây...

export interface GameComponentProps extends BaseGameProps {}

export const GAME_COMPONENTS: Partial<Record<GameType, React.LazyExoticComponent<React.FC<GameComponentProps>>>> = {
  // Quiz
  'speed-quiz': SpeedQuiz,
  'bomb-quiz': BombQuiz,
  'true-false': TrueFalse,
  'brick-breaker': BrickBreaker,
  'quiz-race': QuizRace,
  // Vocabulary
  'memory-match': MemoryMatch,
  'matching-wires': MatchingWires,
  'word-scramble': WordScramble,
  'drag-classify': DragClassify,
  'bingo': Bingo,
  'crossword': Crossword,
  // Strategy
  'sort-order': SortOrder,
  'treasure-hunt': TreasureHunt,
  'snakes-ladders': SnakesLadders,
  'countdown-challenge': CountdownChallenge,
  // Creative
  'wheel-spin': WheelSpin,
  'mystery-box': MysteryBox,
  'reveal-puzzle': RevealPuzzle,
  'blur-image': BlurImage,
  // Team
  'relay-quiz': RelayQuiz,
  'jeopardy': Jeopardy,
  'battle-quiz': BattleQuiz,
  'boat-race': BoatRace,
}
