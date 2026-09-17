import { useEffect, useMemo, useState } from 'react'
import ProjectCard from '../components/ProjectCard'
import NewProjectModal from '../components/NewProjectModal'
import { createProject, deleteProject, listFloors, listProjects } from '../db/repository'
import type { Floor, Project } from '../types'
import { timeGreeting } from '../lib/greeting'
import { applyTheme, loadTheme, saveTheme, type ThemeMode } from '../lib/theme'
import { loadSampleFloorPlan } from '../lib/sampleFloorPlan'
import { hasSeededFullDefault, markFullDefaultSeeded } from '../lib/fullSeed'
import { useNavigate } from 'react-router-dom'
import AppTopNav from '../components/AppTopNav'
import './HomePage.css'

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [floorsByProject, setFloorsByProject] = useState<Record<string, Floor[]>>({})
  const [search, setSearch] = useState('')
  const [showNewProject, setShowNewProject] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>('system')
  const navigate = useNavigate()

  useEffect(() => {
    setTheme(loadTheme())
    refresh()
  }, [])

  async function refresh() {
    let list = (await listProjects()).filter((p) => p.kind !== 'lite')

    // First-time use: seed one clearly-labeled sample project so the list isn't empty on arrival.
    if (list.length === 0 && !hasSeededFullDefault()) {
      markFullDefaultSeeded()
      const sampleImage = await loadSampleFloorPlan()
      await createProject('三房兩廳居家範例', sampleImage, { isSample: true })
      list = (await listProjects()).filter((p) => p.kind !== 'lite')
    }

    setProjects(list)
    const entries = await Promise.all(
      list.map(async (p) => [p.id, await listFloors(p.id)] as const),
    )
    setFloorsByProject(Object.fromEntries(entries))
  }

  async function handleCreate(name: string, image: File | null) {
    const project = await createProject(name, image)
    setShowNewProject(false)
    await refresh()
    const floors = await listFloors(project.id)
    if (floors[0]) navigate(`/project/${project.id}/floor/${floors[0].id}`)
  }

  async function handleDelete(id: string) {
    await deleteProject(id)
    await refresh()
  }

  function toggleTheme() {
    const next: ThemeMode = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
    setTheme(next)
    saveTheme(next)
    applyTheme(next)
  }

  const filtered = useMemo(
    () => projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [projects, search],
  )

  // The sample project always leads, with "新增專案" right after it, so both
  // stay put regardless of how other projects get created/reordered.
  const sampleProject = filtered.find((p) => p.isSample)
  const otherProjects = filtered.filter((p) => !p.isSample)

  return (
    <div className="home-page">
      <AppTopNav theme={theme} onToggleTheme={toggleTheme} />

      <main className="home-main">
        <h1 className="home-greeting">{timeGreeting()}</h1>
        <p className="home-subtitle">{projects.length} 個平面圖專案</p>

        <input
          className="home-search"
          placeholder="搜尋專案…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="home-grid">
          {sampleProject && (
            <ProjectCard
              project={sampleProject}
              floors={floorsByProject[sampleProject.id] ?? []}
              onDelete={handleDelete}
            />
          )}

          <button className="home-add-tile" onClick={() => setShowNewProject(true)}>
            <span className="home-add-icon">+</span>
            <span>新增專案</span>
          </button>

          {otherProjects.map((project) => (
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
      </main>

      {showNewProject && (
        <NewProjectModal onClose={() => setShowNewProject(false)} onCreate={handleCreate} />
      )}
    </div>
  )
}
