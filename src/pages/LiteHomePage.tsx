import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProjectCard from '../components/ProjectCard'
import LiteTemplatePickerModal from '../components/LiteTemplatePickerModal'
import { createLiteProject, deleteProject, listFloors, listProjects } from '../db/repository'
import { LITE_DEFAULT_TEMPLATE_ID } from '../data/liteTemplates'
import type { Floor, Project } from '../types'
import { timeGreeting } from '../lib/greeting'
import { hasSeededLiteDefault, markLiteDefaultSeeded } from '../lib/liteSeed'
import { ArrowLeftIcon } from '../components/icons'
import '../pages/HomePage.css'
import './LiteHomePage.css'

function WifiHouseIllustration() {
  return (
    <svg className="lite-promo-illustration" viewBox="0 0 100 100" width="76" height="76">
      <circle cx="50" cy="52" r="46" fill="rgba(255,255,255,0.14)" />
      <circle cx="50" cy="52" r="35" fill="rgba(255,255,255,0.12)" />
      <path d="M31 45 a27 27 0 0 1 38 0" stroke="#fff" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M38 52 a17 17 0 0 1 24 0" stroke="#fff" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.9" />
      <circle cx="50" cy="59" r="3.4" fill="#fff" />
      <path d="M17 71 L50 44 L83 71 Z" fill="#fff" />
      <path
        d="M26 68 L26 89 L74 89 L74 68"
        stroke="#fff"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="44" y="75" width="12" height="14" rx="1.5" fill="#4338ca" />
      <rect x="31" y="75" width="9" height="9" rx="1.5" fill="#4338ca" opacity="0.85" />
      <rect x="60" y="75" width="9" height="9" rx="1.5" fill="#4338ca" opacity="0.85" />
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
    let list = (await listProjects()).filter((p) => p.kind === 'lite')

    // First-time use: seed one clearly-labeled sample project so the list isn't empty on arrival.
    if (list.length === 0 && !hasSeededLiteDefault()) {
      markLiteDefaultSeeded()
      await createLiteProject('30-50 坪居家範例', LITE_DEFAULT_TEMPLATE_ID, { isSample: true })
      list = (await listProjects()).filter((p) => p.kind === 'lite')
    }

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

            <button className="home-add-tile lite-add-tile" onClick={() => setShowNewProject(true)}>
              <span className="home-add-icon">+</span>
              <span>新增專案</span>
            </button>
          </div>

          {filtered.length === 0 && projects.length > 0 && (
            <p className="home-empty">沒有符合搜尋條件的專案。</p>
          )}
        </div>

        <div className="lite-promo-banner">
          <WifiHouseIllustration />
          <div className="lite-promo-text">
            <div className="lite-promo-title">格局訊號，一眼就懂</div>
            <div className="lite-promo-subtitle">選擇坪數與格局，立即找到適合你的 Mesh 配置</div>
            <div className="lite-promo-cta">更多設定請至 Web 版 ASUS Floor Plan</div>
          </div>
        </div>
      </main>

      {showNewProject && (
        <LiteTemplatePickerModal onClose={() => setShowNewProject(false)} onPick={handleCreate} />
      )}
    </div>
  )
}
