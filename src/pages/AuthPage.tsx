import { useState } from 'react'
import { supabase, isSupabaseEnabled } from '../lib/supabase'
import { useStore } from '../store/useStore'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { fetchInitialData } = useStore()

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!isSupabaseEnabled) {
      setError('Supabase не настроен в .env. Используйте мок-режим.')
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        const { error } = await supabase!.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { data, error } = await supabase!.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: name, role: 'manager' } // Default role for new signups
          }
        })
        if (error) throw error
        if (data.user) {
          // Profile creation is usually handled via DB triggers in Supabase, 
          // but we can also manually check/create here if needed.
        }
      }
      await fetchInitialData()
    } catch (err: any) {
      setError(err.message || 'Ошибка авторизации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="welcome">
      <div className="auth-card" style={{ 
        background: 'var(--bg-glass)', 
        padding: 40, 
        borderRadius: 24, 
        width: '100%', 
        maxWidth: 400,
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h1 style={{ fontSize: 28, margin: 0 }}>Mika Tasks</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            {isLogin ? 'Вход в систему' : 'Регистрация нового пользователя'}
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'var(--red-bg)', 
            color: 'var(--red)', 
            padding: '12px 16px', 
            borderRadius: 12, 
            marginBottom: 24,
            fontSize: 14,
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!isLogin && (
            <div className="form-group">
              <label>Имя</label>
              <input 
                type="text" 
                className="input" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                placeholder="Иван Иванов"
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              className="input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="admin@example.com"
            />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input 
              type="password" 
              className="input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: 44, marginTop: 12 }} disabled={loading}>
            {loading ? 'Секунду...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
          <button 
            type="button" 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent)', 
              marginLeft: 4, 
              cursor: 'pointer',
              fontWeight: 600
            }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Создать' : 'Войти'}
          </button>
        </div>
      </div>
      
      {!isSupabaseEnabled && (
        <div style={{ position: 'fixed', bottom: 40, background: 'rgba(255,255,0,0.1)', padding: '8px 16px', borderRadius: 20, fontSize: 12, color: 'var(--amber)' }}>
          ⚠️ Режим демонстрации: Supabase не подключен
        </div>
      )}
    </div>
  )
}
