'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Assignment, shouldShowReminder, calculateUrgency } from '@/lib/types'
import { differenceInDays, format } from 'date-fns'

export function useNotifications(
  assignments: Assignment[],
  markReminded: (id: string) => void
) {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false)
  const [lastCheck, setLastCheck] = React.useState<Date | null>(null)

  // Request notification permission on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true)
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          setNotificationsEnabled(permission === 'granted')
        })
      }
    }
  }, [])

  // Check for reminders periodically
  React.useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      
      // Only check once per minute at most
      if (lastCheck && now.getTime() - lastCheck.getTime() < 60000) {
        return
      }

      const pendingReminders = assignments.filter(
        (a) => !a.completed && shouldShowReminder(a)
      )

      pendingReminders.forEach((assignment) => {
        const urgency = calculateUrgency(new Date(assignment.dueDate))
        const daysLeft = differenceInDays(new Date(assignment.dueDate), now)

        let message = ''
        if (daysLeft < 0) {
          message = `"${assignment.title}" is ${Math.abs(daysLeft)} days overdue!`
        } else if (daysLeft === 0) {
          message = `"${assignment.title}" is due today!`
        } else if (daysLeft === 1) {
          message = `"${assignment.title}" is due tomorrow`
        } else {
          message = `"${assignment.title}" is due ${format(new Date(assignment.dueDate), 'EEEE, MMM d')}`
        }

        // Show toast notification
        if (urgency.level === 'urgent') {
          toast.error(message, {
            description: `${assignment.subject} - Don&apos;t forget to complete this task!`,
            duration: 8000,
          })
        } else {
          toast.info(message, {
            description: assignment.subject,
            duration: 5000,
          })
        }

        // Show browser notification if enabled
        if (notificationsEnabled && document.hidden) {
          new Notification('StudyTrack Reminder', {
            body: message,
            icon: '/icon.svg',
            tag: assignment.id,
          })
        }

        // Mark as reminded
        markReminded(assignment.id)
      })

      setLastCheck(now)
    }

    // Check immediately on mount
    const timeout = setTimeout(checkReminders, 2000)

    // Check every 5 minutes
    const interval = setInterval(checkReminders, 5 * 60 * 1000)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [assignments, markReminded, notificationsEnabled, lastCheck])

  return { notificationsEnabled, setNotificationsEnabled }
}
