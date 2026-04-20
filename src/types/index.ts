export type TaskStatus = 'backlog' | 'planned' | 'in_progress' | 'blocked' | 'review' | 'done' | 'archived'
export type TaskDepartment = 'marketing' | 'sales' | 'product' | 'management'
export type TaskPriority = 'low' | 'normal' | 'high'
export type UserRole = 'admin' | 'manager'
export type NotificationChannel = 'desktop' | 'telegram'
export type NotificationStatus = 'pending' | 'sent' | 'failed'

export interface User {
  id: string
  name: string
  email: string
  avatar_url?: string
  telegram_id?: string
  timezone: string
  role: UserRole
  notify_desktop: boolean
  notify_telegram: boolean
  created_at: string
}

export interface Project {
  id: string
  owner_id: string
  title: string
  description?: string
  color: string
  emoji?: string
  position: number
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  assignee_id?: string
  title: string
  description?: string
  status: TaskStatus
  department: TaskDepartment
  priority: TaskPriority
  start_date?: string
  end_date?: string
  remind_at?: string
  completed_at?: string
  order: number
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  project_id?: string
  title?: string
  content: string
  color: string
  position_x: number
  position_y: number
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  task_id: string
  channel: NotificationChannel
  scheduled_at: string
  sent_at?: string
  status: NotificationStatus
  payload?: string
  created_at: string
}

export interface ProjectMember {
  project_id: string
  user_id: string
  role: UserRole
}

export interface TaskHistory {
  id: string
  task_id: string
  user_id?: string
  action_type: 'status_change' | 'move' | 'assign' | 'update' | 'create'
  from_value?: string
  to_value?: string
  description?: string
  created_at: string
}

// UI helpers
export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  backlog: { label: 'Бэклог', color: '#64748b', bg: '#f1f5f9' },
  planned: { label: 'Запланировано', color: '#2563eb', bg: '#dbeafe' },
  in_progress: { label: 'В работе', color: '#7c3aed', bg: '#ede9fe' },
  blocked: { label: 'Заблокировано', color: '#dc2626', bg: '#fee2e2' },
  review: { label: 'Проверка', color: '#ea580c', bg: '#ffedd5' },
  done: { label: 'Готово', color: '#16a34a', bg: '#dcfce7' },
  archived: { label: 'Архив', color: '#475569', bg: '#f1f5f9' },
}

export const DEPARTMENT_CONFIG: Record<TaskDepartment, { label: string; short: string; color: string; bg: string }> = {
  marketing: { label: 'Маркетинг', short: 'МКТ', color: '#f472b6', bg: 'rgba(244,114,182,0.15)' },
  sales: { label: 'Продажи', short: 'СЛС', color: '#fb923c', bg: 'rgba(251,146,60,0.15)' },
  product: { label: 'Продукт', short: 'ПРД', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
  management: { label: 'Управление', short: 'УПР', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
}

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Низкий', color: '#64748b' },
  normal: { label: 'Обычный', color: '#60a5fa' },
  high: { label: 'Высокий', color: '#f87171' },
}

export const KANBAN_COLUMNS: TaskStatus[] = ['backlog', 'planned', 'in_progress', 'review', 'done']
