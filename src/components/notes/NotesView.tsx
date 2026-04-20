import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useStore } from '../../store/useStore'
import type { Note } from '../../types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface Props {
  projectId: string
}

// Default color for new notes

export default function NotesView({ projectId }: Props) {
  const { notes, addNote, updateNote, deleteNote } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  const projectNotes = notes.filter(n => n.project_id === projectId)

  function handleAdd() {
    addNote({
      project_id: projectId,
      title: '',
      content: 'Новая заметка...',
      color: '#fefce8',
      position_x: 0,
      position_y: 0,
    })
  }

  function startEdit(note: Note) {
    setEditingId(note.id)
    setEditTitle(note.title || '')
    setEditContent(note.content)
  }

  function saveEdit(note: Note) {
    updateNote(note.id, { title: editTitle, content: editContent })
    setEditingId(null)
  }

  function handleDelete(id: string) {
    if (confirm('Удалить заметку?')) deleteNote(id)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Notes toolbar */}
      <div className="topbar" style={{ padding: '10px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
          🗒️ <span>{projectNotes.length} заметок</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>
          <Plus size={14} />
          Добавить стикер
        </button>
      </div>

      {/* Canvas */}
      <div className="notes-canvas">
        {projectNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🗒️</div>
            <div className="empty-state-title">Заметок пока нет</div>
            <div className="empty-state-desc">Добавьте первый стикер с идеями или важной информацией</div>
            <button className="btn btn-primary" onClick={handleAdd}>
              <Plus size={14} />
              Создать стикер
            </button>
          </div>
        ) : (
          <div className="notes-grid">
            {projectNotes.map(note => (
              <StickyNoteCard
                key={note.id}
                note={note}
                isEditing={editingId === note.id}
                editTitle={editTitle}
                editContent={editContent}
                onEditTitle={setEditTitle}
                onEditContent={setEditContent}
                onStartEdit={() => startEdit(note)}
                onSave={() => saveEdit(note)}
                onDelete={() => handleDelete(note.id)}
                onColorChange={(color) => updateNote(note.id, { color })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Sticky Note Card ──────────────────────────────────────────── */
interface CardProps {
  note: Note
  isEditing: boolean
  editTitle: string
  editContent: string
  onEditTitle: (v: string) => void
  onEditContent: (v: string) => void
  onStartEdit: () => void
  onSave: () => void
  onDelete: () => void
  onColorChange: (color: string) => void
}

function StickyNoteCard({
  note, isEditing, editTitle, editContent,
  onEditTitle, onEditContent, onStartEdit, onSave, onDelete, onColorChange
}: CardProps) {
  const colors = ['#fefce8', '#fef3c7', '#ecfccb', '#e0f2fe', '#fce7f3']

  return (
    <div
      className={`sticky-note ${isEditing ? 'editing' : ''}`}
      style={{ background: note.color }}
    >
      {isEditing ? (
        <>
          <input
            className="editable sticky-note-title"
            value={editTitle}
            onChange={e => onEditTitle(e.target.value)}
            placeholder="Заголовок..."
            autoFocus
            style={{ marginBottom: 8, fontWeight: 700, fontSize: 12, color: '#44403c', textTransform: 'uppercase', letterSpacing: '0.3px' }}
          />
          <textarea
            className="editable sticky-note-content"
            value={editContent}
            onChange={e => onEditContent(e.target.value)}
            placeholder="Текст заметки..."
            rows={5}
            style={{ flex: 1, lineHeight: 1.5 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => onColorChange(c)}
                  style={{
                    width: 16, height: 16, borderRadius: '50%', background: c,
                    border: note.color === c ? '2px solid #a8a29e' : '1px solid rgba(0,0,0,0.12)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
            <button
              onClick={onSave}
              style={{
                padding: '4px 12px', borderRadius: 6, border: 'none',
                background: 'rgba(0,0,0,0.12)', color: '#57534e',
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
              }}
            >
              Сохранить
            </button>
          </div>
        </>
      ) : (
        <>
          {note.title && <div className="sticky-note-title">{note.title}</div>}
          <div className="sticky-note-content">{note.content}</div>
          <div className="sticky-note-footer">
            <span className="sticky-note-date">
              {format(new Date(note.updated_at), 'd MMM', { locale: ru })}
            </span>
            <div className="sticky-note-actions">
              <button className="sticky-note-action-btn" onClick={onStartEdit} title="Редактировать">
                <Pencil size={11} />
              </button>
              <button className="sticky-note-action-btn" onClick={onDelete} title="Удалить" style={{ color: '#ef4444' }}>
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
