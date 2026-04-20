import { useRef } from 'react'
import { format, addDays, startOfDay, differenceInDays, isToday, isWeekend, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarDays, Calendar } from 'lucide-react'
import type { Task } from '../../types'
import { DEPARTMENT_CONFIG } from '../../types'
import { useStore } from '../../store/useStore'

interface Props {
  tasks: Task[]          // filtered tasks
  allProjectTasks: Task[] // unfiltered (for backlog zone)
  onTaskClick: (task: Task) => void
}

const DAY_WIDTH = 36
const ROW_HEIGHT = 44
const DAYS_BEFORE = 14
const TOTAL_DAYS = 90

export default function GanttView({ tasks, allProjectTasks, onTaskClick }: Props) {
  const { updateTask } = useStore()
  const timelineRef = useRef<HTMLDivElement>(null)

  const today = startOfDay(new Date())
  const startDate = addDays(today, -DAYS_BEFORE)
  const days = Array.from({ length: TOTAL_DAYS }, (_, i) => addDays(startDate, i))

  // Split: scheduled (has start+end) and backlog (no dates)
  const scheduledTasks = tasks.filter(t => t.start_date && t.end_date)
  const backlogTasks = allProjectTasks.filter(t => !t.start_date || !t.end_date)

  function dayOffset(dateStr: string) {
    return differenceInDays(startOfDay(parseISO(dateStr)), startDate)
  }

  function barStyle(task: Task) {
    if (!task.start_date || !task.end_date) return {}
    const left = dayOffset(task.start_date) * DAY_WIDTH
    const width = Math.max((differenceInDays(parseISO(task.end_date), parseISO(task.start_date)) + 1) * DAY_WIDTH, DAY_WIDTH)
    const deptCfg = DEPARTMENT_CONFIG[task.department]
    return { left, width, background: deptCfg.color }
  }

  // Dragging bar
  const dragState = useRef<{ taskId: string; startX: number; origStart: string; origEnd: string } | null>(null)

  function onBarMouseDown(e: React.MouseEvent, task: Task) {
    e.stopPropagation()
    dragState.current = {
      taskId: task.id,
      startX: e.clientX,
      origStart: task.start_date!,
      origEnd: task.end_date!,
    }
    window.addEventListener('mousemove', onBarMouseMove)
    window.addEventListener('mouseup', onBarMouseUp)
  }

  function onBarMouseMove(e: MouseEvent) {
    if (!dragState.current) return
    const dx = e.clientX - dragState.current.startX
    const daysDelta = Math.round(dx / DAY_WIDTH)
    if (daysDelta === 0) return
    const newStart = format(addDays(parseISO(dragState.current.origStart), daysDelta), 'yyyy-MM-dd')
    const newEnd = format(addDays(parseISO(dragState.current.origEnd), daysDelta), 'yyyy-MM-dd')
    updateTask(dragState.current.taskId, { start_date: newStart, end_date: newEnd })
  }

  function onBarMouseUp() {
    dragState.current = null
    window.removeEventListener('mousemove', onBarMouseMove)
    window.removeEventListener('mouseup', onBarMouseUp)
  }

  return (
    <div className="gantt-container">
      {/* Scheduled zone */}
      <div className="gantt-zone gantt-zone-scheduled">
        <div className="gantt-zone-header">
          <CalendarDays size={13} />
          Расписанные задачи ({scheduledTasks.length})
        </div>

        <div className="gantt-inner" style={{ flex: 1, overflow: 'hidden' }}>
          {/* Task list */}
          <div className="gantt-task-list">
            <div className="gantt-task-list-header">Задача</div>
            {scheduledTasks.map(task => (
              <div
                key={task.id}
                className="gantt-task-row"
                onClick={() => onTaskClick(task)}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: DEPARTMENT_CONFIG[task.department].color,
                    flexShrink: 0,
                  }}
                />
                <span className="truncate" style={{ fontSize: 12 }}>{task.title}</span>
              </div>
            ))}
            {scheduledTasks.length === 0 && (
              <div className="empty-state" style={{ padding: 24, fontSize: 12 }}>
                <span>Нет запланированных задач</span>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="gantt-timeline" ref={timelineRef}>
            {/* Header: days */}
            <div className="gantt-timeline-header" style={{ width: TOTAL_DAYS * DAY_WIDTH }}>
              {days.map((day, i) => (
                <div
                  key={i}
                  className={`gantt-day-header ${isToday(day) ? 'today' : ''} ${isWeekend(day) ? 'weekend' : ''}`}
                  style={{ width: DAY_WIDTH }}
                >
                  <div style={{ fontSize: 9, fontWeight: 600 }}>{format(day, 'EEE', { locale: ru })}</div>
                  <div style={{ fontSize: 10 }}>{format(day, 'd')}</div>
                </div>
              ))}
            </div>

            {/* Rows with bars */}
            <div className="gantt-rows" style={{ width: TOTAL_DAYS * DAY_WIDTH }}>
              {scheduledTasks.map(task => {
                const bs = barStyle(task)
                const isDone = task.status === 'done'
                const isBlocked = task.status === 'blocked'

                return (
                  <div key={task.id} className="gantt-row" style={{ height: ROW_HEIGHT }}>
                    {/* Background cells */}
                    {days.map((day, i) => (
                      <div
                        key={i}
                        className={`gantt-cell ${isToday(day) ? 'today' : ''}`}
                        style={{ width: DAY_WIDTH }}
                      />
                    ))}

                    {/* Bar */}
                    {bs.left !== undefined && (
                      <div
                        className={`gantt-bar ${isDone ? 'done' : ''} ${isBlocked ? 'blocked' : ''}`}
                        style={{
                          left: bs.left,
                          width: bs.width,
                          background: bs.background as string,
                          opacity: isDone ? 0.4 : 0.9,
                        }}
                        onMouseDown={(e) => onBarMouseDown(e, task)}
                        onClick={(e) => { e.stopPropagation(); onTaskClick(task) }}
                        title={task.title}
                      >
                        <span className="truncate" style={{ color: 'white', fontSize: 11 }}>
                          {task.title}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Backlog zone */}
      <div className="gantt-zone gantt-zone-backlog">
        <div className="gantt-zone-header" style={{ position: 'sticky', top: 0 }}>
          <Calendar size={13} />
          Без дат — бэклог ({backlogTasks.length})
        </div>
        <div className="gantt-backlog-list">
          {backlogTasks.map(task => (
            <div
              key={task.id}
              className="gantt-backlog-item"
              onClick={() => onTaskClick(task)}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: DEPARTMENT_CONFIG[task.department].color,
                  flexShrink: 0,
                }}
              />
              <span className="badge" style={{
                background: DEPARTMENT_CONFIG[task.department].bg,
                color: DEPARTMENT_CONFIG[task.department].color,
                fontSize: 10,
              }}>
                {DEPARTMENT_CONFIG[task.department].short}
              </span>
              <span style={{ fontSize: 13 }}>{task.title}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                Нажмите чтобы задать даты
              </span>
            </div>
          ))}
          {backlogTasks.length === 0 && (
            <div style={{ padding: '12px 24px', color: 'var(--text-muted)', fontSize: 12 }}>
              Все задачи имеют даты ✓
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
