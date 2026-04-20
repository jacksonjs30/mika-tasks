import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { supabase } from './lib/supabase'
import Sidebar from './components/Sidebar'
import ProjectView from './components/ProjectView'
import SettingsPage from './pages/SettingsPage'
import ArchivePage from './pages/ArchivePage'
import WelcomePage from './pages/WelcomePage'
import AuthPage from './pages/AuthPage'
import { useNotifications } from './hooks/useNotifications'

export default function App() {
  const { 
    activeProjectId, 
    fetchInitialData, 
    loading, 
    session, 
    useSupabase 
  } = useStore()

  useNotifications()

  useEffect(() => {
    fetchInitialData()

    // Listen for auth changes
    if (useSupabase) {
      const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
        if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT') {
          fetchInitialData()
        }
      })
      return () => subscription.unsubscribe()
    }
  }, [fetchInitialData, useSupabase])

  if (loading) {
    return (
      <div className="welcome">
        <div className="spinner" style={{ fontSize: 40, marginBottom: 20 }}>🛰️</div>
        <div>Загрузка Mika Tasks...</div>
      </div>
    )
  }

  // Auth Guard
  if (useSupabase && !session) {
    return <AuthPage />
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to={activeProjectId ? `/project/${activeProjectId}` : '/welcome'} replace />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/project/:projectId" element={<ProjectView />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
