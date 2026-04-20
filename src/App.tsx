import { useState } from 'react'
import { useStore } from './store/useStore'
import Sidebar from './components/Sidebar'
import ProjectView from './components/ProjectView'
import SettingsPage from './pages/SettingsPage'
import ArchivePage from './pages/ArchivePage'
import WelcomePage from './pages/WelcomePage'

type AppPage = 'project' | 'archive' | 'settings'

export default function App() {
  const { activeProjectId } = useStore()
  const [page, setPage] = useState<AppPage>('project')

  return (
    <div className="app-layout">
      <Sidebar onNavigate={setPage} currentPage={page} />
      <div className="main-content">
        {page === 'archive' && <ArchivePage />}
        {page === 'settings' && <SettingsPage />}
        {page === 'project' && (
          activeProjectId ? <ProjectView /> : <WelcomePage />
        )}
      </div>
    </div>
  )
}
