import { supabase, isSupabaseEnabled } from './supabase'
import type { Project, Task, Note, User, TaskHistory } from '../types'

/**
 * Mika Tasks Data Service
 * Handles interaction with Supabase or provides mock fallbacks.
 */

export const dataService = {
  // ─── Projects ─────────────────────────────────────────────────────────────
  async getProjects(): Promise<Project[]> {
    if (!isSupabaseEnabled) return []
    const { data, error } = await supabase!
      .from('projects')
      .select('*')
      .order('position', { ascending: true })
    
    if (error) throw error
    return data as Project[]
  },

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    if (!isSupabaseEnabled) throw new Error('Supabase not configured')
    const { data, error } = await supabase!
      .from('projects')
      .insert(project)
      .select()
      .single()
    
    if (error) throw error
    return data as Project
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    if (!isSupabaseEnabled) return
    const { error } = await supabase!
      .from('projects')
      .update(updates)
      .eq('id', id)
    
    if (error) throw error
  },

  async deleteProject(id: string): Promise<void> {
    if (!isSupabaseEnabled) return
    const { error } = await supabase!
      .from('projects')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // ─── Tasks ────────────────────────────────────────────────────────────────
  async getTasks(projectId: string): Promise<Task[]> {
    if (!isSupabaseEnabled) return []
    const { data, error } = await supabase!
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('order', { ascending: true })
    
    if (error) throw error
    return data as Task[]
  },

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    if (!isSupabaseEnabled) throw new Error('Supabase not configured')
    const { data, error } = await supabase!
      .from('tasks')
      .insert(task)
      .select()
      .single()
    
    if (error) throw error
    return data as Task
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    if (!isSupabaseEnabled) return
    const { error } = await supabase!
      .from('tasks')
      .update(updates)
      .eq('id', id)
    
    if (error) throw error
  },

  async deleteTask(id: string): Promise<void> {
    if (!isSupabaseEnabled) return
    const { error } = await supabase!
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // ─── Task History ──────────────────────────────────────────────────────────
  async getTaskHistory(taskId: string): Promise<TaskHistory[]> {
    if (!isSupabaseEnabled) return []
    const { data, error } = await supabase!
      .from('task_history')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as TaskHistory[]
  },

  async createTaskHistory(history: Omit<TaskHistory, 'id' | 'created_at'>): Promise<TaskHistory> {
    if (!isSupabaseEnabled) throw new Error('Supabase not configured')
    const { data, error } = await supabase!
      .from('task_history')
      .insert(history)
      .select()
      .single()
    
    if (error) throw error
    return data as TaskHistory
  },

  // ─── Notes ────────────────────────────────────────────────────────────────
  async getNotes(projectId: string): Promise<Note[]> {
    if (!isSupabaseEnabled) return []
    const { data, error } = await supabase!
      .from('notes')
      .select('*')
      .eq('project_id', projectId)
    
    if (error) throw error
    return data as Note[]
  },

  async createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
    if (!isSupabaseEnabled) throw new Error('Supabase not configured')
    const { data, error } = await supabase!
      .from('notes')
      .insert(note)
      .select()
      .single()
    
    if (error) throw error
    return data as Note
  },

  async updateNote(id: string, updates: Partial<Note>): Promise<void> {
    if (!isSupabaseEnabled) return
    const { error } = await supabase!
      .from('notes')
      .update(updates)
      .eq('id', id)
    
    if (error) throw error
  },

  async deleteNote(id: string): Promise<void> {
    if (!isSupabaseEnabled) return
    const { error } = await supabase!
      .from('notes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // ─── User Profiles ─────────────────────────────────────────────────────────
  async getProfile(userId: string): Promise<User | null> {
    if (!isSupabaseEnabled) return null
    const { data, error } = await supabase!
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data as User | null
  },

  async getAllProfiles(): Promise<User[]> {
    if (!isSupabaseEnabled) return []
    const { data, error } = await supabase!
      .from('profiles')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data as User[]
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    if (!isSupabaseEnabled) return
    const { error } = await supabase!
      .from('profiles')
      .update(updates)
      .eq('id', userId)
    
    if (error) throw error
  }
}
