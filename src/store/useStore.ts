import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import type { Project, Task, Note, User } from '../types'
import { dataService } from '../lib/dataService'
import { supabase, isSupabaseEnabled } from '../lib/supabase'

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
  /* ... existing mock projects ... */
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
  currentUser: User | null
  session: Session | null
  projects: Project[]
  tasks: Task[]
  notes: Note[]
  allUsers: User[]
  activeProjectId: string | null
  loading: boolean
  useSupabase: boolean

  fetchInitialData: () => Promise<void>
  fetchUsers: () => Promise<void>
  setActiveProject: (id: string | null) => void
  
  addProject: (p: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateProject: (id: string, p: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  addTask: (t: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateTask: (id: string, t: Partial<Task>, logMessage?: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTask: (taskId: string, newStatus: Task['status'], newOrder?: number) => Promise<void>
  getTaskHistory: (taskId: string) => Promise<TaskHistory[]>
  logTaskAction: (taskId: string, action_type: TaskHistory['action_type'], from?: string, to?: string, desc?: string) => Promise<void>

  addNote: (n: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateNote: (id: string, n: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>

  updateUser: (u: Partial<User>) => Promise<void>
  logout: () => Promise<void>
  archiveOldTasks: () => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  session: null,
  projects: [],
  tasks: [],
  notes: [],
  allUsers: [],
  activeProjectId: null,
  loading: true,
  useSupabase: isSupabaseEnabled,

  fetchInitialData: async () => {
    if (!isSupabaseEnabled) {
      set({ 
        currentUser: MOCK_USER, 
        projects: MOCK_PROJECTS, 
        tasks: MOCK_TASKS,
        notes: MOCK_NOTES,
        activeProjectId: 'proj-1',
        loading: false 
      })
      return
    }

    set({ loading: true })
    try {
      const { data: { session } } = await supabase!.auth.getSession()
      set({ session })

      if (session) {
        const profile = await dataService.getProfile(session.user.id)
        set({ currentUser: profile })

        const projects = await dataService.getProjects()
        const activeId = projects.length > 0 ? projects[0].id : null
        
        let tasks: Task[] = []
        let notes: Note[] = []
        
        if (activeId) {
          tasks = await dataService.getTasks(activeId)
          notes = await dataService.getNotes(activeId)
        }
        
        set({ projects, tasks, notes, activeProjectId: activeId })
        get().fetchUsers()
      }
      set({ loading: false })
    } catch (e) {
      console.error('Failed to fetch data:', e)
      set({ loading: false })
    }
  },

  fetchUsers: async () => {
    if (!isSupabaseEnabled) return
    try {
      const users = await dataService.getAllProfiles()
      set({ allUsers: users })
    } catch (e) {
      console.error('Failed to fetch users:', e)
    }
  },

  setActiveProject: async (id) => {
    set({ activeProjectId: id })
    if (isSupabaseEnabled && id) {
      set({ loading: true })
      try {
        const [tasks, notes] = await Promise.all([
          dataService.getTasks(id),
          dataService.getNotes(id)
        ])
        set({ tasks, notes, loading: false })
      } catch (e) {
        console.error('Failed to switch project:', e)
        set({ loading: false })
      }
    }
  },

  addProject: async (p) => {
    if (isSupabaseEnabled) {
      const newP = await dataService.createProject(p)
      set((s) => ({ projects: [...s.projects, newP] }))
    } else {
      const newProject: Project = {
        ...p,
        id: `proj-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      set((s) => ({ projects: [...s.projects, newProject] }))
    }
  },

  updateProject: async (id, p) => {
    if (isSupabaseEnabled) {
      await dataService.updateProject(id, p)
    }
    set((s) => ({
      projects: s.projects.map((proj) =>
        proj.id === id ? { ...proj, ...p, updated_at: new Date().toISOString() } : proj
      ),
    }))
  },

  deleteProject: async (id) => {
    if (isSupabaseEnabled) {
      await dataService.deleteProject(id)
    }
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      tasks: s.tasks.filter((t) => t.project_id !== id),
      notes: s.notes.filter((n) => n.project_id !== id),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
    }))
  },

  addTask: async (t) => {
    if (isSupabaseEnabled) {
      const newT = await dataService.createTask(t)
      set((s) => ({ tasks: [...s.tasks, newT] }))
      get().logTaskAction(newT.id, 'create', undefined, undefined, 'Задача создана')
    } else {
      const newTask: Task = {
        ...t,
        id: `task-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      set((s) => ({ tasks: [...s.tasks, newTask] }))
    }
  },

  updateTask: async (id, t, logMessage) => {
    const s = get()
    const oldTask = s.tasks.find(tk => tk.id === id)
    
    if (isSupabaseEnabled) {
      await dataService.updateTask(id, t)
      
      // Log history if important fields changed
      if (oldTask) {
        if (t.status && t.status !== oldTask.status) {
          get().logTaskAction(id, 'status_change', oldTask.status, t.status, logMessage)
        }
        if (t.assignee_id !== undefined && t.assignee_id !== oldTask.assignee_id) {
          const newUser = s.allUsers.find(u => u.id === t.assignee_id)
          get().logTaskAction(id, 'assign', oldTask.assignee_id, t.assignee_id, `Исполнитель изменен на ${newUser?.name || 'не задан'}`)
        }
      }
    }
    
    set((s) => ({
      tasks: s.tasks.map((task) =>
        task.id === id ? { ...task, ...t, updated_at: new Date().toISOString() } : task
      ),
    }))
  },

  deleteTask: async (id) => {
    if (isSupabaseEnabled) {
      await dataService.deleteTask(id)
    }
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
  },

  moveTask: async (taskId, newStatus, newOrder) => {
    const s = get()
    const task = s.tasks.find(t => t.id === taskId)
    if (!task) return

    // Get all tasks in target column (excluding moving one)
    const colTasks = s.tasks
      .filter(t => t.project_id === task.project_id && t.status === newStatus && t.id !== taskId)
      .sort((a, b) => a.order - b.order)

    // Insert moving task into new position
    colTasks.splice(newOrder ?? 0, 0, { ...task, status: newStatus })

    // Recalculate orders
    const updatedWithOrder = colTasks.map((t, idx) => ({
      ...t,
      order: idx,
      updated_at: t.id === taskId ? new Date().toISOString() : t.updated_at,
      completed_at: t.id === taskId && newStatus === 'done' ? new Date().toISOString() : t.completed_at
    }))

    // Update state locally
    const otherTasks = s.tasks.filter(t => t.project_id !== task.project_id || t.status !== newStatus || t.id === taskId)
    // Actually simpler: map the whole tasks array
    const finalTasks = s.tasks.map(t => {
      const updated = updatedWithOrder.find(u => u.id === t.id)
      if (updated) return updated
      if (t.id === taskId) return { ...t, status: newStatus, order: newOrder ?? 0 }
      return t
    })

    set({ tasks: finalTasks })

    // Sync with Supabase (only for the moving task primarily, but ideally for all if order changed)
    if (isSupabaseEnabled) {
      try {
        const target = updatedWithOrder.find(u => u.id === taskId)
        if (target) {
          await dataService.updateTask(taskId, { 
            status: target.status, 
            order: target.order,
            completed_at: target.completed_at
          })
          
          if (task.status !== newStatus) {
            get().logTaskAction(taskId, 'status_change', task.status, newStatus, `Статус изменен на ${newStatus}`)
          }
        }
      } catch (e) {
        console.error('Failed to sync moveTask:', e)
      }
    }
  },

  getTaskHistory: async (taskId) => {
    if (!isSupabaseEnabled) return []
    return dataService.getTaskHistory(taskId)
  },

  logTaskAction: async (taskId, action_type, from_value, to_value, description) => {
    if (!isSupabaseEnabled) return
    const s = get()
    if (!s.currentUser) return
    
    try {
      await dataService.createTaskHistory({
        task_id: taskId,
        user_id: s.currentUser.id,
        action_type,
        from_value,
        to_value,
        description
      })
    } catch (e) {
      console.error('Failed to log task action:', e)
    }
  },

  addNote: async (n) => {
    if (isSupabaseEnabled) {
      const newN = await dataService.createNote(n)
      set((s) => ({ notes: [...s.notes, newN] }))
    } else {
      const newNote: Note = {
        ...n,
        id: `note-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      set((s) => ({ notes: [...s.notes, newNote] }))
    }
  },

  updateNote: async (id, n) => {
    if (isSupabaseEnabled) {
      await dataService.updateNote(id, n)
    }
    set((s) => ({
      notes: s.notes.map((note) =>
        note.id === id ? { ...note, ...n, updated_at: new Date().toISOString() } : note
      ),
    }))
  },

  deleteNote: async (id) => {
    if (isSupabaseEnabled) {
      await dataService.deleteNote(id)
    }
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }))
  },

  updateUser: async (u) => {
    const s = get()
    if (!s.currentUser) return
    
    if (isSupabaseEnabled) {
      await dataService.updateProfile(s.currentUser.id, u)
    }
    set((state) => ({ currentUser: state.currentUser ? { ...state.currentUser, ...u } : null }))
  },

  archiveOldTasks: async () => {
    const oldTasks = get().tasks.filter(t => {
      if (t.status === 'done' && t.completed_at) {
        const daysSince = (Date.now() - new Date(t.completed_at).getTime()) / 86400000
        return daysSince > 30
      }
      return false
    })

    if (isSupabaseEnabled) {
      await Promise.all(oldTasks.map(t => dataService.updateTask(t.id, { status: 'archived' })))
    }

    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (oldTasks.find(ot => ot.id === t.id)) {
          return { ...t, status: 'archived' as Task['status'] }
        }
        return t
      }),
    }))
  },

  logout: async () => {
    if (isSupabaseEnabled) {
      await supabase!.auth.signOut()
    }
    set({ session: null, currentUser: null, projects: [], tasks: [], notes: [], activeProjectId: null })
  },
}))
