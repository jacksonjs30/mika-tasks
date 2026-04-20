import { create } from 'zustand'
import type { Project, Task, Note, User } from '../types'

// ─── Mock user (will be replaced by Supabase Auth) ──────────────────────────
const MOCK_USER: User = {
  id: 'mock-user-1',
  name: 'Администратор',
  email: 'admin@zadachnik.ru',
  timezone: 'Europe/Moscow',
  role: 'admin',
  notify_desktop: true,
  notify_telegram: false,
  created_at: new Date().toISOString(),
}

// ─── Mock data for local development ─────────────────────────────────────────
const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    owner_id: 'mock-user-1',
    title: 'Запуск сайта',
    description: 'Разработка и запуск корпоративного сайта',
    color: '#6366f1',
    emoji: '🚀',
    position: 0,
    is_pinned: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    owner_id: 'mock-user-1',
    title: 'Маркетинговая кампания',
    description: 'Q2 маркетинговые активности',
    color: '#f43f5e',
    emoji: '📣',
    position: 1,
    is_pinned: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-3',
    owner_id: 'mock-user-1',
    title: 'CRM интеграция',
    description: 'Интеграция с внешними сервисами',
    color: '#10b981',
    emoji: '🔗',
    position: 2,
    is_pinned: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const today = new Date()
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000).toISOString().split('T')[0]

const MOCK_TASKS: Task[] = [
  { id: 't1', project_id: 'proj-1', title: 'Разработать дизайн главной страницы', description: '', status: 'done', department: 'product', priority: 'high', start_date: addDays(today, -14), end_date: addDays(today, -7), order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't2', project_id: 'proj-1', title: 'Написать технические требования', description: '', status: 'done', department: 'management', priority: 'normal', start_date: addDays(today, -20), end_date: addDays(today, -10), order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't3', project_id: 'proj-1', title: 'Вёрстка лендинга', description: '', status: 'in_progress', department: 'product', priority: 'high', start_date: addDays(today, -5), end_date: addDays(today, 5), order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't4', project_id: 'proj-1', title: 'Настройка хостинга', description: '', status: 'planned', department: 'product', priority: 'normal', start_date: addDays(today, 3), end_date: addDays(today, 6), order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't5', project_id: 'proj-1', title: 'SEO оптимизация', description: '', status: 'backlog', department: 'marketing', priority: 'low', order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't6', project_id: 'proj-1', title: 'Тестирование на мобильных', description: '', status: 'blocked', department: 'product', priority: 'high', order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't7', project_id: 'proj-2', title: 'Запустить рекламу в VK', description: '', status: 'in_progress', department: 'marketing', priority: 'high', start_date: addDays(today, -3), end_date: addDays(today, 7), order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't8', project_id: 'proj-2', title: 'Создать контент-план', description: '', status: 'review', department: 'marketing', priority: 'normal', start_date: addDays(today, -7), end_date: addDays(today, 2), order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't9', project_id: 'proj-2', title: 'Email рассылка', description: '', status: 'planned', department: 'sales', priority: 'normal', start_date: addDays(today, 5), end_date: addDays(today, 10), order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't10', project_id: 'proj-3', title: 'API интеграция с AmoCRM', description: '', status: 'in_progress', department: 'product', priority: 'high', start_date: addDays(today, -2), end_date: addDays(today, 8), order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

const MOCK_NOTES: Note[] = [
  { id: 'n1', project_id: 'proj-1', title: 'Идея', content: 'Добавить анимацию при загрузке страницы', color: '#fef08a', position_x: 40, position_y: 40, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'n2', project_id: 'proj-1', title: '', content: 'Уточнить у клиента цветовую палитру — он хотел синий акцент', color: '#fef08a', position_x: 280, position_y: 60, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'n3', project_id: 'proj-2', title: 'Важно', content: 'Бюджет кампании — 50,000 руб. Согласовать с финансами до пятницы!', color: '#fde68a', position_x: 40, position_y: 40, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

// ─── Store ────────────────────────────────────────────────────────────────────
interface AppState {
  currentUser: User
  projects: Project[]
  tasks: Task[]
  notes: Note[]
  activeProjectId: string | null
  useSupabase: boolean

  setActiveProject: (id: string | null) => void
  addProject: (p: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void
  updateProject: (id: string, p: Partial<Project>) => void
  deleteProject: (id: string) => void

  addTask: (t: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void
  updateTask: (id: string, t: Partial<Task>) => void
  deleteTask: (id: string) => void
  moveTask: (taskId: string, newStatus: Task['status'], newOrder?: number) => void

  addNote: (n: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => void
  updateNote: (id: string, n: Partial<Note>) => void
  deleteNote: (id: string) => void

  updateUser: (u: Partial<User>) => void
  archiveOldTasks: () => void
}

export const useStore = create<AppState>((set) => ({
  currentUser: MOCK_USER,
  projects: MOCK_PROJECTS,
  tasks: MOCK_TASKS,
  notes: MOCK_NOTES,
  activeProjectId: 'proj-1',
  useSupabase: false,

  setActiveProject: (id) => set({ activeProjectId: id }),

  addProject: (p) => {
    const newProject: Project = {
      ...p,
      id: `proj-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    set((s) => ({ projects: [...s.projects, newProject] }))
  },

  updateProject: (id, p) =>
    set((s) => ({
      projects: s.projects.map((proj) =>
        proj.id === id ? { ...proj, ...p, updated_at: new Date().toISOString() } : proj
      ),
    })),

  deleteProject: (id) =>
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      tasks: s.tasks.filter((t) => t.project_id !== id),
      notes: s.notes.filter((n) => n.project_id !== id),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
    })),

  addTask: (t) => {
    const newTask: Task = {
      ...t,
      id: `task-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    set((s) => ({ tasks: [...s.tasks, newTask] }))
  },

  updateTask: (id, t) =>
    set((s) => ({
      tasks: s.tasks.map((task) =>
        task.id === id ? { ...task, ...t, updated_at: new Date().toISOString() } : task
      ),
    })),

  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  moveTask: (taskId, newStatus) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              completed_at: newStatus === 'done' ? new Date().toISOString() : t.completed_at,
              updated_at: new Date().toISOString(),
            }
          : t
      ),
    })),

  addNote: (n) => {
    const newNote: Note = {
      ...n,
      id: `note-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    set((s) => ({ notes: [...s.notes, newNote] }))
  },

  updateNote: (id, n) =>
    set((s) => ({
      notes: s.notes.map((note) =>
        note.id === id ? { ...note, ...n, updated_at: new Date().toISOString() } : note
      ),
    })),

  deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

  updateUser: (u) => set((s) => ({ currentUser: { ...s.currentUser, ...u } })),

  archiveOldTasks: () =>
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.status === 'done' && t.completed_at) {
          const daysSince = (Date.now() - new Date(t.completed_at).getTime()) / 86400000
          if (daysSince > 30) return { ...t, status: 'archived' as Task['status'] }
        }
        return t
      }),
    })),
}))
