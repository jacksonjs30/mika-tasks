import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { Plus, Calendar, Bell, AlertTriangle } from 'lucide-react'
import { useStore } from '../../store/useStore'
import type { Task, TaskStatus } from '../../types'
import { KANBAN_COLUMNS, STATUS_CONFIG, DEPARTMENT_CONFIG, PRIORITY_CONFIG } from '../../types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface Props {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onAddTask: (status?: TaskStatus) => void
}

export default function KanbanView({ tasks, onTaskClick, onAddTask }: Props) {
  const { moveTask } = useStore()

  function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const newStatus = result.destination.droppableId as TaskStatus
    const newOrder = result.destination.index
    moveTask(result.draggableId, newStatus, newOrder)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-board">
        {KANBAN_COLUMNS.map(status => {
          const colTasks = tasks
            .filter(t => t.status === status)
            .sort((a, b) => a.order - b.order)
          const cfg = STATUS_CONFIG[status]

          return (
            <div key={status} className="kanban-column">
              {/* Header */}
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <span
                    className="kanban-column-dot"
                    style={{ background: cfg.color }}
                  />
                  {cfg.label}
                </div>
                <span className="kanban-column-count">{colTasks.length}</span>
              </div>

              {/* Drop zone */}
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`kanban-column-body ${snapshot.isDraggingOver ? 'over' : ''}`}
                  >
                    {colTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                            onClick={() => onTaskClick(task)}
                            style={{
                              ...provided.draggableProps.style,
                              borderLeft: `3px solid ${PRIORITY_CONFIG[task.priority].color}`,
                            }}
                          >
                            <div className="task-card-title">{task.title}</div>

                            <div className="task-card-meta">
                              <span
                                className="badge"
                                style={{
                                  background: DEPARTMENT_CONFIG[task.department].bg,
                                  color: DEPARTMENT_CONFIG[task.department].color,
                                }}
                              >
                                {DEPARTMENT_CONFIG[task.department].short}
                              </span>

                              {task.priority === 'high' && (
                                <span
                                  className="badge"
                                  style={{ background: 'var(--red-bg)', color: 'var(--red)' }}
                                >
                                  <AlertTriangle size={9} />
                                  Высокий
                                </span>
                              )}

                              {task.status === 'blocked' && (
                                <span
                                  className="badge"
                                  style={{ background: 'var(--red-bg)', color: 'var(--red)' }}
                                >
                                  🚫 Blocked
                                </span>
                              )}
                            </div>

                            <div className="task-card-footer">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {task.end_date && (
                                  <span
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 3,
                                      fontSize: 11,
                                      color: isOverdue(task.end_date) ? 'var(--red)' : 'var(--text-muted)',
                                    }}
                                  >
                                    <Calendar size={10} />
                                    {format(new Date(task.end_date), 'd MMM', { locale: ru })}
                                  </span>
                                )}
                                {task.remind_at && (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--yellow)' }}>
                                    <Bell size={10} />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* Add button */}
                    <button className="kanban-add-btn" onClick={() => onAddTask(status)}>
                      <Plus size={13} />
                      Добавить задачу
                    </button>
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}

function isOverdue(dateStr: string) {
  return new Date(dateStr) < new Date()
}
