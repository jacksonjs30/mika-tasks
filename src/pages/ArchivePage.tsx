import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Archive, RotateCcw, Trash2, Search } from 'lucide-react'
import { DEPARTMENT_CONFIG } from '../types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function ArchivePage() {
  const { tasks, projects, updateTask, deleteTask } = useStore()
  const [search, setSearch] = useState('')
  const [filterProject, setFilterProject] = useState('all')

  const archived = tasks
    .filter(t => t.status === 'archived')
    .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()))
    .filter(t => filterProject === 'all' || t.project_id === filterProject)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  function restore(id: string) {
    updateTask(id, { status: 'done' })
  }

  function hardDelete(id: string) {
    if (confirm('Полностью удалить задачу? Это действие необратимо.')) {
      deleteTask(id)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Header */}
      <div className="topbar">
        <div className="topbar-title">
          <Archive size={18} />
          Архив задач
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: 32, width: 220 }}
              placeholder="Поиск в архиве..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input"
            style={{ width: 160 }}
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
          >
            <option value="all">Все проекты</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Count */}
      <div style={{ padding: '8px 24px', fontSize: 12, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', flexShrink: 0 }}>
        {archived.length} задач в архиве
      </div>

      {/* List */}
      <div className="archive-page">
        {archived.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">Архив пуст</div>
            <div className="empty-state-desc">Задачи, переведённые в «Готово» более 30 дней назад, появятся здесь автоматически</div>
          </div>
        ) : (
          archived.map(task => {
            const project = projects.find(p => p.id === task.project_id)
            const deptCfg = DEPARTMENT_CONFIG[task.department]
            // priority info is available in task.priority

            return (
              <div key={task.id} className="archive-task-row">
                {/* Status dot */}
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', flexShrink: 0 }} />

                {/* Project label */}
                {project && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                    {project.emoji} {project.title}
                  </span>
                )}

                {/* Department badge */}
                <span className="badge" style={{ background: deptCfg.bg, color: deptCfg.color }}>
                  {deptCfg.short}
                </span>

                {/* Title */}
                <span style={{ fontSize: 13, flex: 1, color: 'var(--text-secondary)' }} className="truncate">
                  {task.title}
                </span>

                {/* Date */}
                <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {format(new Date(task.updated_at), 'd MMM yyyy', { locale: ru })}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => restore(task.id)}
                    title="Восстановить"
                  >
                    <RotateCcw size={12} />
                    Восстановить
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => hardDelete(task.id)}
                    title="Удалить навсегда"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
