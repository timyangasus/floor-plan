import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProjectCard from '../components/ProjectCard'
import LiteTemplatePickerModal from '../components/LiteTemplatePickerModal'
import { createLiteProject, deleteProject, listFloors, listProjects } from '../db/repository'
import type { Floor, Project } from '../types'
import { timeGreeting } from '../lib/greeting'
import { ArrowLeftIcon } from '../components/icons'
import '../pages/HomePage.css'
import './LiteHomePage.css'

function WifiHouseIllustration() {
  return (
    <svg className="lite-promo-illustration" viewBox="0 0 100 90" width="72" height="65">
      <path d="M30 40 a28 28 0 0 1 40 0" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d="M38 48 a16 16 0 0 1 24 0" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.9" />
      <circle cx="50" cy="56" r="3.5" fill="#fff" />
      <path
        d="M16 66 L50 40 L84 66"
        stroke="#fff"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 62 L24 84 L76 84 L76 62"
        stroke="#fff"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="43" y="68" width="14" height="16" fill="#fff" opacity="0.9" />
    </svg>
  )
}

export default function LiteHomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [floorsByProject, setFloorsByProject] = useState<Record<string, Floor[]>>({})
  const [search, setSearch] = useState('')
  const [showNewProject, setShowNewProject] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    refresh()
  }, [])

  async function refresh() {
    const list = (await listProjects()).filter((p) => p.kind === 'lite')
    setProjects(list)
    const entries = await Promise.all(list.map(async (p) => [p.id, await listFloors(p.id)] as const))
    setFloorsByProject(Object.fromEntries(entries))
  }

  async function handleCreate(templateId: string, name?: string) {
    const project = await createLiteProject(name || '我的家', templateId)
    setShowNewProject(false)
    await refresh()
    const floors = await listFloors(project.id)
    if (floors[0]) navigate(`/project/${project.id}/floor/${floors[0].id}`)
  }

  async function handleDelete(id: string) {
    await deleteProject(id)
    await refresh()
  }

  const filtered = useMemo(
    () => projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [projects, search],
  )

  return (
    <div className="home-page">
      <header className="lite-home-header">
        <button className="lite-back" onClick={() => navigate('/')} aria-label="返回 Router App 首頁">
          <ArrowLeftIcon />
        </button>
        <div className="lite-header-title">Floor Plan Lite</div>
        <button className="lite-header-add" onClick={() => setShowNewProject(true)}>
          <span className="lite-header-add-icon">+</span>
          新增專案
        </button>
      </header>

      <main className="home-main lite-home-main">
        <div className="lite-home-content">
          <h1 className="home-greeting">{timeGreeting()}</h1>
          <p className="home-subtitle">{projects.length} 個簡易專案</p>

          <input
            className="home-search"
            placeholder="搜尋專案…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="home-grid">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                floors={floorsByProject[project.id] ?? []}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {filtered.length === 0 && projects.length > 0 && (
            <p className="home-empty">沒有符合搜尋條件的專案。</p>
          )}

          {projects.length === 0 && <p className="home-empty">還沒有簡易專案，點右上角「新增專案」開始。</p>}
        </div>

        <button className="lite-promo-banner" onClick={() => navigate('/home')}>
          <WifiHouseIllustration />
          <div className="lite-promo-text">
            <div className="lite-promo-title">格局訊號，一眼就懂</div>
            <div className="lite-promo-subtitle">選擇坪數與格局，立即找到適合你的 Mesh 配置</div>
            <div className="lite-promo-cta">更多設定請至 Web 版 →</div>
          </div>
        </button>
      </main>

      {showNewProject && (
        <LiteTemplatePickerModal onClose={() => setShowNewProject(false)} onPick={handleCreate} />
      )}
    </div>
  )
}
