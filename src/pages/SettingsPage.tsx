import { useState } from 'react'
import { Settings, Bell, User, Bot, Shield, Archive } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function SettingsPage() {
  const { currentUser, updateUser, archiveOldTasks } = useStore()
  const [telegramId, setTelegramId] = useState(currentUser.telegram_id || '')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    updateUser({ telegram_id: telegramId || undefined })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function requestDesktopPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then(perm => {
        alert(perm === 'granted' ? 'Уведомления разрешены ✓' : 'Уведомления запрещены')
      })
    } else {
      alert('Ваш браузер не поддерживает уведомления')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Header */}
      <div className="topbar">
        <div className="topbar-title">
          <Settings size={18} />
          Настройки
        </div>
      </div>

      <div className="settings-page">
        {/* Profile */}
        <div className="settings-section">
          <h3 className="settings-section-title">
            <User size={15} /> Профиль
          </h3>

          <div className="settings-row">
            <div>
              <div style={{ fontWeight: 500 }}>{currentUser.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{currentUser.email}</div>
            </div>
            <span className="badge" style={{
              background: currentUser.role === 'admin' ? 'var(--purple-bg)' : 'var(--blue-bg)',
              color: currentUser.role === 'admin' ? 'var(--purple)' : 'var(--blue)',
            }}>
              {currentUser.role === 'admin' ? '👑 Администратор' : '👤 Менеджер'}
            </span>
          </div>

          <div className="settings-row">
            <div>
              <div style={{ fontWeight: 500 }}>Часовой пояс</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{currentUser.timezone}</div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <h3 className="settings-section-title">
            <Bell size={15} /> Уведомления
          </h3>

          <div className="settings-row">
            <div>
              <div style={{ fontWeight: 500 }}>Desktop-уведомления</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Системные уведомления при наступлении напоминания
                <br />
                Статус: {
                  'Notification' in window
                    ? Notification.permission === 'granted'
                      ? <span style={{ color: 'var(--green)' }}>Разрешено ✓</span>
                      : <span style={{ color: 'var(--yellow)' }}>Не разрешено</span>
                    : <span style={{ color: 'var(--text-muted)' }}>Не поддерживается</span>
                }
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={currentUser.notify_desktop}
                  onChange={e => updateUser({ notify_desktop: e.target.checked })}
                />
                <span className="toggle-slider" />
              </label>
              <button className="btn btn-outline btn-sm" onClick={requestDesktopPermission}>
                Разрешить
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <div style={{ fontWeight: 500 }}>Telegram-уведомления</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Присылать напоминания в Telegram-бот
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={currentUser.notify_telegram}
                onChange={e => updateUser({ notify_telegram: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* Telegram Bot */}
        <div className="settings-section">
          <h3 className="settings-section-title">
            <Bot size={15} /> Telegram Bot
          </h3>

          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>
            Для получения уведомлений в Telegram введите ваш <b>Telegram Chat ID</b>.
            <br />
            Его можно узнать написав боту <a href="https://t.me/userinfobot" target="_blank" rel="noopener">@userinfobot</a>.
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className="input"
              placeholder="Ваш Telegram Chat ID (например: 123456789)"
              value={telegramId}
              onChange={e => setTelegramId(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary btn-sm" onClick={handleSave} style={{ flexShrink: 0 }}>
              {saved ? 'Сохранено ✓' : 'Сохранить'}
            </button>
          </div>
        </div>

        {/* Archive settings */}
        <div className="settings-section">
          <h3 className="settings-section-title">
            <Archive size={15} /> Архивация
          </h3>

          <div className="settings-row">
            <div>
              <div style={{ fontWeight: 500 }}>Автоархивация задач</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Задачи в статусе «Готово» автоматически перемещаются в архив через 30 дней
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="btn btn-outline btn-sm" onClick={() => { archiveOldTasks(); alert('Проверка выполнена') }}>
              🔄 Запустить проверку вручную
            </button>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 12 }}>
              Переведёт в архив все задачи «Готово» старше 30 дней
            </span>
          </div>
        </div>

        {/* Суpabase */}
        <div className="settings-section">
          <h3 className="settings-section-title">
            <Shield size={15} /> Supabase / Backend
          </h3>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Сейчас приложение работает в режиме <b>локальных данных</b> (Zustand store).
            <br />
            Для синхронизации с базой данных подключите Supabase:
            <br />
            1. Создайте проект на <a href="https://supabase.com" target="_blank" rel="noopener">supabase.com</a> (бесплатно)
            <br />
            2. Скопируйте <b>URL</b> и <b>anon key</b> из настроек проекта
            <br />
            3. Вставьте их в файл <code style={{ background: 'var(--bg-surface-3)', padding: '2px 6px', borderRadius: 4 }}>.env</code>
          </div>
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-surface-3)', borderRadius: 'var(--radius)', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            VITE_SUPABASE_URL=https://xxxxx.supabase.co<br />
            VITE_SUPABASE_ANON_KEY=eyJhbGci...
          </div>
        </div>
      </div>
    </div>
  )
}
