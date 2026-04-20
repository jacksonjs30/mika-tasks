import { useState, useEffect } from 'react'
import { X, Calendar, Bell } from 'lucide-react'
import { useStore } from '../../store/useStore'
import type { Task, TaskStatus, TaskDepartment, TaskPriority } from '../../types'
import { STATUS_CONFIG, DEPARTMENT_CONFIG, PRIORITY_CONFIG } from '../../types'
import { Avatar } from '../Avatar'
import { User as UserIcon, History } from 'lucide-react'

interface Props {
  task: Task | null
  projectId: string
  onClose: () => void
}

const defaultForm = () => ({
  title: '',
  description: '',
  status: 'backlog' as TaskStatus,
  department: 'product' as TaskDepartment,
  priority: 'normal' as TaskPriority,
  start_date: '',
  end_date: '',
  remind_at: '',
  notify_desktop: true,
  notify_telegram: false,
  assignee_id: '' as string,
})

export default function TaskModal({ task, projectId, onClose }: Props) {
  const { addTask, updateTask, deleteTask, currentUser, allUsers, getTaskHistory } = useStore()
  const [form, setForm] = useState(defaultForm())
  const isNew = !task

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        department: task.department,
        priority: task.priority,
        start_date: task.start_date || '',
        end_date: task.end_date || '',
        remind_at: task.remind_at || '',
        notify_desktop: currentUser?.notify_desktop ?? true,
        notify_telegram: currentUser?.notify_telegram ?? false,
        assignee_id: task.assignee_id || '',
      })
    }
  }, [task, currentUser])

  const [activeTab, setActiveTab] = useState<'general' | 'history'>('general')
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    if (activeTab === 'history' && task) {
      getTaskHistory(task.id).then(setHistory)
    }
  }, [activeTab, task, getTaskHistory])

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSave() {
    if (!form.title.trim()) return

    if (isNew) {
      addTask({
        project_id: projectId,
        title: form.title,
        description: form.description,
        status: form.status,
        department: form.department,
        priority: form.priority,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
        remind_at: form.remind_at || undefined,
        assignee_id: form.assignee_id || undefined,
        order: 0,
      })
    } else {
      updateTask(task!.id, {
        title: form.title,
        description: form.description,
        status: form.status,
        department: form.department,
        priority: form.priority,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
        remind_at: form.remind_at || undefined,
        assignee_id: form.assignee_id || undefined,
      })

      // Schedule desktop notification if needed
      if (form.remind_at && form.notify_desktop) {
        scheduleDesktopNotification(form.title, form.remind_at)
      }
    }
    onClose()
  }

  function handleDelete() {
    if (task && confirm('Удалить задачу?')) {
      deleteTask(task.id)
      onClose()
    }
  }

  function handleArchive() {
    if (task) {
      updateTask(task.id, { status: 'archived' })
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal task-modal">
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <h2 className="modal-title">{isNew ? 'Новая задача' : 'Редактирование задачи'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Tabs */}
        {!isNew && (
          <div className="topbar-tabs" style={{ margin: '16px 0 24px', background: 'var(--bg-surface-2)', padding: 4 }}>
            <button 
              className={`topbar-tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
              style={{ flex: 1, padding: '8px' }}
            >
              <UserIcon size={14} /> Общее
            </button>
            <button 
              className={`topbar-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
              style={{ flex: 1, padding: '8px' }}
            >
              <History size={14} /> История
            </button>
          </div>
        )}

        {activeTab === 'general' ? (
          <>

        {/* Title */}
        <div className="form-group">
          <label className="form-label">Название *</label>
          <input
            className="input"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Что нужно сделать?"
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Описание</label>
          <textarea
            className="input"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Подробное описание, чеклист..."
            rows={3}
          />
        </div>

        {/* Status + Department + Assignee */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Статус</label>
            <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
              {Object.entries(STATUS_CONFIG)
                .filter(([k]) => k !== 'archived')
                .map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Отдел</label>
            <select className="input" value={form.department} onChange={e => set('department', e.target.value)}>
              {Object.entries(DEPARTMENT_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Исполнитель</label>
            <select className="input" value={form.assignee_id} onChange={e => set('assignee_id', e.target.value)}>
              <option value="">Не назначен</option>
              {allUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority */}
        <div className="form-group">
          <label className="form-label">Приоритет</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => set('priority', key)}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius)',
                  border: `1px solid ${form.priority === key ? cfg.color : 'var(--border)'}`,
                  background: form.priority === key ? `${cfg.color}20` : 'var(--bg-surface-3)',
                  color: form.priority === key ? cfg.color : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  transition: 'var(--transition)',
                  fontFamily: 'inherit',
                }}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <Calendar size={11} style={{ display: 'inline' }} /> Дата начала
            </label>
            <input
              type="date"
              className="input"
              value={form.start_date}
              onChange={e => set('start_date', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <Calendar size={11} style={{ display: 'inline' }} /> Дата окончания
            </label>
            <input
              type="date"
              className="input"
              value={form.end_date}
              onChange={e => set('end_date', e.target.value)}
            />
          </div>
        </div>

        {/* Reminder */}
        <div className="form-group" style={{ marginTop: 12 }}>
          <label className="form-label">
            <Bell size={11} style={{ display: 'inline' }} /> Напоминание
          </label>
          <input
            type="datetime-local"
            className="input"
            value={form.remind_at}
            onChange={e => set('remind_at', e.target.value)}
          />
        </div>

        {/* Notification channels */}
        {form.remind_at && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={form.notify_desktop}
                onChange={e => set('notify_desktop', e.target.checked)}
              />
              💻 Desktop
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={form.notify_telegram}
                onChange={e => set('notify_telegram', e.target.checked)}
              />
              ✈️ Telegram
            </label>
          </div>
        )}
        </>
        ) : (
          /* History Tab */
          <div className="flex-col gap-4" style={{ minHeight: 300, maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
            {history.length === 0 ? (
              <div className="text-muted text-sm" style={{ textAlign: 'center', marginTop: 40 }}>История пуста</div>
            ) : (
              history.map(item => {
                const user = allUsers.find(u => u.id === item.user_id)
                return (
                  <div key={item.id} className="flex gap-3 items-start" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <Avatar name={user?.name} src={user?.avatar_url} size={24} />
                    <div className="flex-col gap-1">
                      <div className="text-sm font-medium">
                        {user?.name || 'Система'} <span className="text-muted" style={{ fontWeight: 400 }}>{item.description || 'изменил задачу'}</span>
                      </div>
                      <div className="text-xs text-muted">
                        {new Date(item.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isNew && currentUser.role === 'admin' && (
              <>
                <button className="btn btn-ghost btn-sm" onClick={handleArchive}>
                  📦 В архив
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                  Удалить
                </button>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Отмена</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!form.title.trim()}>
              {isNew ? 'Создать' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function scheduleDesktopNotification(title: string, remindAt: string) {
  if (!('Notification' in window)) return
  const delay = new Date(remindAt).getTime() - Date.now()
  if (delay <= 0) return

  const scheduleNotif = () => {
    setTimeout(() => {
      new Notification('📋 Напоминание по задаче', {
        body: title,
        icon: '/vite.svg',
      })
    }, delay)
  }

  if (Notification.permission === 'granted') {
    scheduleNotif()
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') scheduleNotif()
    })
  }
}
