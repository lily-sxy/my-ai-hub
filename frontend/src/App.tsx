import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/Shell/AppShell'
import { Desktop } from './pages/Desktop'
import { Chat } from './pages/Chat'
import { Planner } from './pages/Planner'
import { Trash } from './pages/Trash'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/desktop" replace />} />
        <Route path="/desktop" element={<Desktop />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:threadId" element={<Chat />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/trash" element={<Trash />} />
      </Routes>
    </AppShell>
  )
}
