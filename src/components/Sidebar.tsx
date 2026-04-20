import { useState } from 'react'
import {
  Archive, Settings, Plus, Pin, ChevronDown, ChevronRight, Trash2, Pencil
} from 'lucide-react'
import { useStore } from '../store/useStore'
import type { Project } from '../types'
import ProjectModal from './modals/ProjectModal'

interface Props {
  onNavigate: (page: 'project' | 'archive' | 'settings') => void
  currentPage: string
}

export default function Sidebar({ onNavigate, currentPage }: Props) {
  const { projects, activeProjectId, setActiveProject, deleteProject, updateProject } = useStore()
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const pinned = projects.filter(p => p.is_pinned).sort((a, b) => a.position - b.position)
  const unpinned = projects.filter(p => !p.is_pinned).sort((a, b) => a.position - b.position)

  function handleSelectProject(id: string) {
    setActiveProject(id)
    onNavigate('project')
  }

  function handlePin(e: React.MouseEvent, p: Project) {
    e.stopPropagation()
    updateProject(p.id, { is_pinned: !p.is_pinned })
  }

  function handleEdit(e: React.MouseEvent, p: Project) {
    e.stopPropagation()
    setEditingProject(p)
    setShowProjectModal(true)
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (confirm('Удалить проект? Все задачи и заметки будут удалены.')) {
      deleteProject(id)
      onNavigate('project')
    }
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">📋</div>
        <span className="sidebar-logo-text">Задачник</span>
      </div>

      {/* Pinned projects */}
      {pinned.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-section-label">Закреплённые</div>
          <nav className="sidebar-nav">
            {pinned.map(p => (
              <ProjectNavItem
                key={p.id}
                project={p}
                active={activeProjectId === p.id && currentPage === 'project'}
                onSelect={handleSelectProject}
                onPin={handlePin}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </nav>
        </div>
      )}

      {/* All projects */}
      <div className="sidebar-section" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <button
          className="sidebar-section-label"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', width: '100%', padding: '0 8px', color: 'var(--text-muted)' }}
          onClick={() => setProjectsOpen(o => !o)}
        >
          <span>Проекты</span>
          {projectsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>

        {projectsOpen && (
          <div className="sidebar-projects">
            <nav className="sidebar-nav" style={{ marginTop: 4 }}>
              {unpinned.map(p => (
                <ProjectNavItem
                  key={p.id}
                  project={p}
                  active={activeProjectId === p.id && currentPage === 'project'}
                  onSelect={handleSelectProject}
                  onPin={handlePin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
              <button
                className="sidebar-nav-item"
                style={{ color: 'var(--text-muted)' }}
                onClick={() => { setEditingProject(null); setShowProjectModal(true) }}
              >
                <Plus size={14} />
                <span>Новый проект</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="sidebar-bottom">
        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${currentPage === 'archive' ? 'active' : ''}`}
            onClick={() => onNavigate('archive')}
          >
            <Archive size={15} />
            <span>Архив задач</span>
          </button>
          <button
            className={`sidebar-nav-item ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => onNavigate('settings')}
          >
            <Settings size={15} />
            <span>Настройки</span>
          </button>
        </nav>
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <ProjectModal
          project={editingProject}
          onClose={() => setShowProjectModal(false)}
        />
      )}
    </aside>
  )
}

/* ─── Project Nav Item ──────────────────────────────────────────── */
interface ItemProps {
  project: Project
  active: boolean
  onSelect: (id: string) => void
  onPin: (e: React.MouseEvent, p: Project) => void
  onEdit: (e: React.MouseEvent, p: Project) => void
  onDelete: (e: React.MouseEvent, id: string) => void
}

function ProjectNavItem({ project, active, onSelect, onPin, onEdit, onDelete }: ItemProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`sidebar-nav-item ${active ? 'active' : ''}`}
      onClick={() => onSelect(project.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ justifyContent: 'space-between' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
        {project.emoji ? (
          <span className="sidebar-project-emoji">{project.emoji}</span>
        ) : (
          <span className="sidebar-project-dot" style={{ background: project.color }} />
        )}
        <span className="truncate" style={{ fontSize: 13 }}>{project.title}</span>
      </div>

      {hovered && (
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <button
            className="btn-icon"
            style={{ padding: 2 }}
            onClick={(e) => onPin(e, project)}
            data-tooltip={project.is_pinned ? 'Открепить' : 'Закрепить'}
          >
            <Pin size={11} className={project.is_pinned ? 'text-accent' : ''} />
          </button>
          <button
            className="btn-icon"
            style={{ padding: 2 }}
            onClick={(e) => onEdit(e, project)}
          >
            <Pencil size={11} />
          </button>
          <button
            className="btn-icon"
            style={{ padding: 2, color: 'var(--red)' }}
            onClick={(e) => onDelete(e, project.id)}
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}
    </div>
  )
}
