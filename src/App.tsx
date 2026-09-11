import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import EditorPage from './pages/EditorPage'
import TopologyPage from './pages/TopologyPage'
import RouterEntryPage from './pages/RouterEntryPage'
import FloorPlanLitePage from './pages/FloorPlanLitePage'
import { applyTheme, loadTheme } from './lib/theme'
import './App.css'

export default function App() {
  useEffect(() => {
    applyTheme(loadTheme())
  }, [])

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<RouterEntryPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/lite" element={<FloorPlanLitePage />} />
        <Route path="/project/:projectId/floor/:floorId" element={<EditorPage />} />
        <Route path="/project/:projectId/topology" element={<TopologyPage />} />
      </Routes>
    </div>
  )
}
