import { useNavigate } from 'react-router-dom'
import type { Floor, Project } from '../types'
import { useObjectUrl } from '../lib/useObjectUrl'
import { getLiteTemplate } from '../data/liteTemplates'
import LiteFloorPlanSvg from './LiteFloorPlanSvg'
import './ProjectCard.css'

interface Props {
  project: Project
  floors: Floor[]
  onDelete: (id: string) => void
}

export default function ProjectCard({ project, floors, onDelete }: Props) {
  const navigate = useNavigate()
  const thumbFloor = floors[0]
  const thumbUrl = useObjectUrl(thumbFloor?.imageBlob ?? null)
  const thumbTemplate = thumbFloor?.templateId ? getLiteTemplate(thumbFloor.templateId) ?? null : null

  function open() {
    if (!thumbFloor) return
    navigate(`/project/${project.id}/floor/${thumbFloor.id}`)
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (confirm(`刪除專案「${project.name}」？此動作無法復原。`)) {
      onDelete(project.id)
    }
  }

  return (
    <div className="project-card" onClick={open} role="button" tabIndex={0}>
      <div className="project-card-thumb">
        {thumbTemplate ? (
          <LiteFloorPlanSvg template={thumbTemplate} />
        ) : thumbUrl ? (
          <img src={thumbUrl} alt={project.name} />
        ) : (
          <div className="project-card-thumb-empty" />
        )}
        <button className="project-card-delete" onClick={handleDelete} aria-label="刪除專案">
          ×
        </button>
      </div>
      <div className="project-card-body">
        <div className="project-card-name">{project.name}</div>
        <div className="project-card-meta">{floors.length} 層樓</div>
      </div>
    </div>
  )
}
