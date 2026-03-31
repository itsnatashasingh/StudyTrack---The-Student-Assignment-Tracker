export type ReminderFrequency = 
  | 'daily'
  | 'every_2_days'
  | 'every_3_days'
  | 'twice_a_week'
  | 'weekly'
  | 'none'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Assignment {
  id: string
  title: string
  subject: string
  dueDate: Date
  description?: string
  completed: boolean
  createdAt: Date
  reminderFrequency: ReminderFrequency
  lastReminded?: Date
  priority: TaskPriority
}

export interface Subject {
  name: string
  color: string
  totalTasks: number
  completedTasks: number
}

export const REMINDER_FREQUENCY_LABELS: Record<ReminderFrequency, string> = {
  daily: 'Daily',
  every_2_days: 'Every 2 days',
  every_3_days: 'Every 3 days',
  twice_a_week: 'Twice a week',
  weekly: 'Weekly',
  none: 'No reminders',
}

export const SUBJECT_COLORS = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
  'bg-primary',
  'bg-accent',
]

export function getSubjectColor(subjectName: string): string {
  const hash = subjectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return SUBJECT_COLORS[hash % SUBJECT_COLORS.length]
}

export function calculateUrgency(dueDate: Date): { level: TaskPriority; daysLeft: number } {
  const now = new Date()
  const diff = dueDate.getTime() - now.getTime()
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) return { level: 'urgent', daysLeft }
  if (daysLeft <= 1) return { level: 'urgent', daysLeft }
  if (daysLeft <= 3) return { level: 'high', daysLeft }
  if (daysLeft <= 7) return { level: 'medium', daysLeft }
  return { level: 'low', daysLeft }
}

export function shouldShowReminder(assignment: Assignment): boolean {
  if (assignment.completed || assignment.reminderFrequency === 'none') {
    return false
  }

  const now = new Date()
  const lastReminded = assignment.lastReminded ? new Date(assignment.lastReminded) : null
  
  if (!lastReminded) return true

  const daysSinceLastReminder = Math.floor(
    (now.getTime() - lastReminded.getTime()) / (1000 * 60 * 60 * 24)
  )

  switch (assignment.reminderFrequency) {
    case 'daily':
      return daysSinceLastReminder >= 1
    case 'every_2_days':
      return daysSinceLastReminder >= 2
    case 'every_3_days':
      return daysSinceLastReminder >= 3
    case 'twice_a_week':
      return daysSinceLastReminder >= 3
    case 'weekly':
      return daysSinceLastReminder >= 7
    default:
      return false
  }
}
