import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProjectCard from '../components/ProjectCard'
import LiteTemplatePickerModal from '../components/LiteTemplatePickerModal'
import { createLiteProject, deleteProject, listFloors, listProjects } from '../db/repository'
import type { Floor, Project } from '../types'
import { timeGreeting } from '../lib/greeting'
import { ArrowLeftIcon, CheckIcon } from '../components/icons'
import '../pages/HomePage.css'
import './LiteHomePage.css'

const FULL_VERSION_BENEFITS = [
  '上傳你自己的實際平面圖，不受限於預設格局',
  '手繪牆體、選擇建材，模擬更準確的訊號穿牆狀況',
  'Mesh 群組與拓撲圖，管理多台路由器的網狀架構',
  '多樓層管理、3D 檢視',
]

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

        <div className="lite-promo-banner">
          <div className="lite-promo-title">需要更完整的規劃工具？</div>
          <ul className="lite-promo-list">
            {FULL_VERSION_BENEFITS.map((benefit) => (
              <li key={benefit}>
                <CheckIcon size={14} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <button className="lite-promo-cta" onClick={() => navigate('/home')}>
            前往完整版 →
          </button>
        </div>
      </main>

      {showNewProject && (
        <LiteTemplatePickerModal onClose={() => setShowNewProject(false)} onCreate={handleCreate} />
      )}
    </div>
  )
}
