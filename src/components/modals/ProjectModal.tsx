import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useStore } from '../../store/useStore'
import type { Project } from '../../types'

interface Props {
  project: Project | null
  onClose: () => void
}

const PROJECT_COLORS = [
  '#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
]

const PROJECT_EMOJIS = ['🚀', '📣', '🔗', '💡', '🎯', '📊', '🛠️', '🌟', '📱', '🔥', '🎨', '💼']

export default function ProjectModal({ project, onClose }: Props) {
  const { addProject, updateProject, projects } = useStore()
  const isNew = !project

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [emoji, setEmoji] = useState('🚀')

  useEffect(() => {
    if (project) {
      setTitle(project.title)
      setDescription(project.description || '')
      setColor(project.color)
      setEmoji(project.emoji || '🚀')
    }
  }, [project])

  function handleSave() {
    if (!title.trim()) return

    if (isNew) {
      addProject({
        owner_id: 'mock-user-1',
        title,
        description,
        color,
        emoji,
        position: projects.length,
        is_pinned: false,
      })
    } else {
      updateProject(project!.id, { title, description, color, emoji })
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isNew ? 'Новый проект' : 'Редактировать проект'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Preview */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          background: 'var(--bg-surface-3)',
          borderRadius: 'var(--radius)',
          marginBottom: 20,
          border: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 28 }}>{emoji}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{title || 'Название проекта'}</div>
            {description && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{description}</div>}
          </div>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, marginLeft: 'auto', flexShrink: 0 }} />
        </div>

        {/* Title */}
        <div className="form-group">
          <label className="form-label">Название *</label>
          <input
            className="input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Название проекта"
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Описание</label>
          <input
            className="input"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Краткое описание проекта"
          />
        </div>

        {/* Emoji */}
        <div className="form-group">
          <label className="form-label">Иконка</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PROJECT_EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  border: emoji === e ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: emoji === e ? 'var(--accent-subtle)' : 'var(--bg-surface-3)',
                  fontSize: 18,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition)',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="form-group">
          <label className="form-label">Цвет</label>
          <div className="color-picker">
            {PROJECT_COLORS.map(c => (
              <button
                key={c}
                className={`color-swatch ${color === c ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Отмена</button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            {isNew ? 'Создать проект' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
