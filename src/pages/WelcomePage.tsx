import { Plus } from 'lucide-react'
import { useState } from 'react'
import ProjectModal from '../components/modals/ProjectModal'



export default function WelcomePage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="welcome">
      <div className="welcome-icon">📋</div>

      <div>
        <h1 style={{ marginBottom: 8, fontSize: 28, fontWeight: 800 }}>Добро пожаловать</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 460, lineHeight: 1.6 }}>
          Создайте первый проект, чтобы начать работу с задачами, Гантом и стикерами
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Создать проект
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 600, width: '100%', marginTop: 16 }}>
        {[
          { icon: '📋', title: 'Канбан-доска', desc: 'Перетаскивайте задачи между статусами' },
          { icon: '📊', title: 'Диаграмма Ганта', desc: 'Визуализация задач по времени' },
          { icon: '🗒️', title: 'Стикеры', desc: 'Заметки и идеи внутри проекта' },
        ].map(f => (
          <div key={f.title} style={{
            padding: 20,
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{f.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {showModal && <ProjectModal project={null} onClose={() => setShowModal(false)} />}
    </div>
  )
}
