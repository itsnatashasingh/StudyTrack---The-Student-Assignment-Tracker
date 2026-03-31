'use client'

import { BookOpen, Bell } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAssignmentsContext } from '@/lib/store'
import { shouldShowReminder } from '@/lib/types'

interface HeaderProps {
  onOpenReminders: () => void
}

export function Header({ onOpenReminders }: HeaderProps) {
  const { assignments } = useAssignmentsContext()
  
  const pendingReminders = assignments.filter(
    (a) => !a.completed && shouldShowReminder(a)
  ).length

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-none">StudyTrack</h1>
            <p className="text-xs text-muted-foreground">Assignment Tracker</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative size-9"
            onClick={onOpenReminders}
          >
            <Bell className="size-4" />
            {pendingReminders > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 flex size-5 items-center justify-center p-0 text-xs"
              >
                {pendingReminders > 9 ? '9+' : pendingReminders}
              </Badge>
            )}
            <span className="sr-only">View reminders</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
