import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { isAfter, parseISO } from 'date-fns'

export function useNotifications() {
  const { tasks, currentUser } = useStore()
  const notifiedTasks = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!currentUser?.notify_desktop) return

    const checkReminders = () => {
      const now = new Date()
      
      tasks.forEach(task => {
        if (task.remind_at && !notifiedTasks.current.has(task.id)) {
          const remindTime = parseISO(task.remind_at)
          
          if (isAfter(now, remindTime)) {
            // Trigger desktop notification
            if (Notification.permission === 'granted') {
              new Notification('Mika Tasks: Напоминание', {
                body: task.title,
                icon: '/vite.svg' // You can change this to your app icon
              })
              notifiedTasks.current.add(task.id)
            }
          }
        }
      })
    }

    // Check immediately and then every minute
    checkReminders()
    const interval = setInterval(checkReminders, 60000)
    
    return () => clearInterval(interval)
  }, [tasks, currentUser?.notify_desktop])
}
