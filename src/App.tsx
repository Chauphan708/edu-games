import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import Home from './pages/Home'
import JoinRoom from './pages/student/JoinRoom'
import Lobby from './pages/student/Lobby'
import GameWrapper from './pages/student/GameWrapper'
import GameLibrary from './pages/teacher/GameLibrary'
import BulkCreator from './pages/teacher/BulkCreator'
import GameCreator from './pages/teacher/GameCreator'
import LiveSession from './pages/teacher/LiveSession'
import Reports from './pages/teacher/Reports'
import Settings from './pages/teacher/Settings'
import Shop from './pages/student/Shop'
import Leaderboard from './pages/student/Leaderboard'

function App() {
  const { setSessionFromUrl } = useAuth()

  // Handle LMS token passing on first load
  useEffect(() => {
    setSessionFromUrl()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />

        {/* Student */}
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/lobby/:roomCode" element={<Lobby />} />
        <Route path="/play/:roomCode" element={<GameWrapper />} />

        {/* Teacher */}
        <Route path="/teacher" element={<GameLibrary />} />
        <Route path="/teacher/bulk-create" element={<BulkCreator />} />
        <Route path="/teacher/create/:gameType" element={<GameCreator />} />
        <Route path="/teacher/live/:roomCode" element={<LiveSession />} />
        <Route path="/teacher/reports" element={<Reports />} />
        <Route path="/teacher/settings" element={<Settings />} />

        {/* Gamification */}
        <Route path="/shop" element={<Shop />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
