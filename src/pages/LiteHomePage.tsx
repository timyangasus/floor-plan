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

const FULL_VERSION_TAGS = ['📷 自己的照片', '🧱 手繪牆體', '🕸️ Mesh 拓撲', '🧊 3D 檢視']

function RocketIllustration() {
  return (
    <svg className="lite-promo-illustration" viewBox="0 0 120 90" width="88" height="66">
      <circle cx="14" cy="16" r="2" fill="var(--accent)" opacity="0.6" />
      <circle cx="100" cy="12" r="1.6" fill="var(--accent)" opacity="0.5" />
      <circle cx="106" cy="36" r="2.2" fill="var(--accent)" opacity="0.4" />
      <circle cx="16" cy="54" r="1.8" fill="var(--accent)" opacity="0.5" />
      <g transform="translate(60 48) rotate(-18)">
        <path d="M-5 20 C-5 32 5 32 5 20 L4 36 L-4 36 Z" fill="#f97316" />
        <path d="M0 -34 C11 -20 11 6 0 22 C-11 6 -11 -20 0 -34 Z" fill="var(--accent)" />
        <path d="M-9 8 L-21 25 L-4 19 Z" fill="var(--accent)" opacity="0.75" />
        <path d="M9 8 L21 25 L4 19 Z" fill="var(--accent)" opacity="0.75" />
        <circle cx="0" cy="-10" r="6" fill="var(--surface)" />
      </g>
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

  async function handleCreate(name: string, templateId: string) {
    const project = await createLiteProject(name, templateId)
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
      </header>

      <main className="home-main">
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

          <button className="home-add-tile" onClick={() => setShowNewProject(true)}>
            <span className="home-add-icon">+</span>
            <span>新增專案</span>
          </button>
        </div>

        {filtered.length === 0 && projects.length > 0 && (
          <p className="home-empty">沒有符合搜尋條件的專案。</p>
        )}

        <button className="lite-promo-banner" onClick={() => navigate('/home')}>
          <RocketIllustration />
          <div className="lite-promo-title">解鎖完整版，玩出更多花樣</div>
          <div className="lite-promo-tags">
            {FULL_VERSION_TAGS.map((tag) => (
              <span key={tag} className="lite-promo-tag">
                {tag}
              </span>
            ))}
          </div>
          <span className="lite-promo-cta">前往完整版 →</span>
        </button>
      </main>

      {showNewProject && (
        <LiteTemplatePickerModal onClose={() => setShowNewProject(false)} onCreate={handleCreate} />
      )}
    </div>
  )
}
