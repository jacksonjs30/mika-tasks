import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LayoutGrid, GanttChart, StickyNote, Plus, Filter } from 'lucide-react'
import { useStore } from '../store/useStore'
import KanbanView from './kanban/KanbanView'
import GanttView from './gantt/GanttView'
import NotesView from './notes/NotesView'
import TaskModal from './modals/TaskModal'
import type { Task, TaskDepartment, TaskPriority } from '../types'

type ViewTab = 'kanban' | 'gantt' | 'notes'

export default function ProjectView() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { projects, tasks, setActiveProject, loading } = useStore()
  
  const [activeTab, setActiveTab] = useState<ViewTab>('kanban')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterDept, setFilterDept] = useState<TaskDepartment | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all')

  // Sync store with URL
  useEffect(() => {
    if (projectId) {
      setActiveProject(projectId)
    }
  }, [projectId, setActiveProject])

  const project = projects.find(p => p.id === projectId)

  // Redirect if project not found (and not loading)
  useEffect(() => {
    if (!loading && projects.length > 0 && !project && projectId) {
      navigate('/welcome')
    }
  }, [project, loading, projects.length, navigate, projectId])

  if (!project) {
    return (
      <div className="welcome">
        <div style={{ fontSize: 40, marginBottom: 20 }}>🔍</div>
        <div>Проект не найден...</div>
      </div>
    )
  }

  const projectTasks = tasks.filter(t =>
    t.project_id === project.id &&
    t.status !== 'archived' &&
    (filterDept === 'all' || t.department === filterDept) &&
    (filterPriority === 'all' || t.priority === filterPriority)
  )

  function openNewTask() {
    setEditingTask(null)
    setShowTaskModal(true)
  }

  function openEditTask(task: Task) {
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const DEPT_OPTIONS: { value: TaskDepartment | 'all'; label: string }[] = [
    { value: 'all', label: 'Все отделы' },
    { value: 'marketing', label: 'МКТ' },
    { value: 'sales', label: 'СЛС' },
    { value: 'product', label: 'ПРД' },
    { value: 'management', label: 'УПР' },
  ]

  const PRIORITY_OPTIONS: { value: TaskPriority | 'all'; label: string }[] = [
    { value: 'all', label: 'Все приоритеты' },
    { value: 'high', label: '🔴 Высокий' },
    { value: 'normal', label: '🔵 Обычный' },
    { value: 'low', label: '⚪ Низкий' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-title">
          {project.emoji && <span style={{ fontSize: 20 }}>{project.emoji}</span>}
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: project.color,
              display: project.emoji ? 'none' : 'block',
              flexShrink: 0,
            }}
          />
          <span className="truncate">{project.title}</span>
        </div>

        {/* View tabs */}
        <div className="topbar-tabs">
          <button
            className={`topbar-tab ${activeTab === 'kanban' ? 'active' : ''}`}
            onClick={() => setActiveTab('kanban')}
          >
            <LayoutGrid size={14} />
            Канбан
          </button>
          <button
            className={`topbar-tab ${activeTab === 'gantt' ? 'active' : ''}`}
            onClick={() => setActiveTab('gantt')}
          >
            <GanttChart size={14} />
            Гант
          </button>
          <button
            className={`topbar-tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <StickyNote size={14} />
            Заметки
          </button>
        </div>

        {/* Actions */}
        <div className="topbar-actions">
          {activeTab !== 'notes' && (
            <button className="btn btn-primary btn-sm" onClick={() => openNewTask()}>
              <Plus size={14} />
              Задача
            </button>
          )}
        </div>
      </div>

      {/* Filter bar (not for notes) */}
      {activeTab !== 'notes' && (
        <div className="filter-bar">
          <Filter size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          {DEPT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`filter-chip ${filterDept === opt.value ? 'active' : ''}`}
              onClick={() => setFilterDept(opt.value)}
            >
              {opt.label}
            </button>
          ))}
          <span style={{ width: 1, height: 16, background: 'var(--border)', flexShrink: 0, margin: '0 4px' }} />
          {PRIORITY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`filter-chip ${filterPriority === opt.value ? 'active' : ''}`}
              onClick={() => setFilterPriority(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Main view Area */}
      <div className="content-area" style={{ position: 'relative' }}>
        {loading && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <span>Обновление...</span>
          </div>
        )}
        {activeTab === 'kanban' && (
          <KanbanView
            tasks={projectTasks}
            onTaskClick={openEditTask}
            onAddTask={openNewTask}
          />
        )}
        {activeTab === 'gantt' && (
          <GanttView
            tasks={projectTasks}
            allProjectTasks={tasks.filter(t => t.project_id === project.id && t.status !== 'archived')}
            onTaskClick={openEditTask}
          />
        )}
        {activeTab === 'notes' && (
          <NotesView projectId={project.id} />
        )}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          projectId={project.id}
          onClose={() => setShowTaskModal(false)}
        />
      )}
    </div>
  )
}
