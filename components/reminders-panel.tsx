'use client'

import * as React from 'react'
import { format, differenceInDays } from 'date-fns'
import { Bell, BellOff, Clock, Calendar, X, CheckCircle2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Empty } from '@/components/ui/empty'
import { useAssignmentsContext } from '@/lib/store'
import { shouldShowReminder, calculateUrgency, REMINDER_FREQUENCY_LABELS } from '@/lib/types'
import { cn } from '@/lib/utils'

interface RemindersPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RemindersPanel({ open, onOpenChange }: RemindersPanelProps) {
  const { assignments, markReminded, toggleComplete } = useAssignmentsContext()

  const pendingReminders = assignments.filter(
    (a) => !a.completed && shouldShowReminder(a)
  )

  const upcomingDeadlines = assignments
    .filter((a) => !a.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const handleDismiss = (id: string) => {
    markReminded(id)
  }

  const handleComplete = (id: string) => {
    toggleComplete(id)
    markReminded(id)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="size-5" />
            Reminders
          </SheetTitle>
          <SheetDescription>
            Stay on top of your assignments with smart reminders
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100vh-12rem)]">
          <div className="flex flex-col gap-6 pr-4">
            {/* Active Reminders Section */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Bell className="size-4 text-primary" />
                Active Reminders
                {pendingReminders.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {pendingReminders.length}
                  </Badge>
                )}
              </h3>

              {pendingReminders.length === 0 ? (
                <Empty className="py-6">
                  <Empty.Icon>
                    <BellOff className="size-6" />
                  </Empty.Icon>
                  <Empty.Title className="text-sm">All caught up!</Empty.Title>
                  <Empty.Description className="text-xs">
                    No pending reminders right now
                  </Empty.Description>
                </Empty>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendingReminders.map((assignment) => {
                    const urgency = calculateUrgency(new Date(assignment.dueDate))
                    const daysLeft = differenceInDays(
                      new Date(assignment.dueDate),
                      new Date()
                    )

                    return (
                      <div
                        key={assignment.id}
                        className={cn(
                          'rounded-lg border p-3 transition-colors',
                          urgency.level === 'urgent' && 'border-destructive/50 bg-destructive/5',
                          urgency.level === 'high' && 'border-urgent/50 bg-urgent/5'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium leading-tight">
                              {assignment.title}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {assignment.subject}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              <Badge
                                variant="outline"
                                className={cn(
                                  urgency.level === 'urgent' && 'border-destructive text-destructive',
                                  urgency.level === 'high' && 'border-urgent text-urgent'
                                )}
                              >
                                <Calendar className="mr-1 size-3" />
                                {format(new Date(assignment.dueDate), 'MMM d')}
                              </Badge>
                              <span className="text-muted-foreground">
                                {daysLeft < 0
                                  ? `${Math.abs(daysLeft)} days overdue`
                                  : daysLeft === 0
                                  ? 'Due today'
                                  : daysLeft === 1
                                  ? 'Due tomorrow'
                                  : `${daysLeft} days left`}
                              </span>
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => handleComplete(assignment.id)}
                              title="Mark as complete"
                            >
                              <CheckCircle2 className="size-4 text-success" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => handleDismiss(assignment.id)}
                              title="Dismiss reminder"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Reminder: {REMINDER_FREQUENCY_LABELS[assignment.reminderFrequency]}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <Separator />

            {/* Upcoming Deadlines Section */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Clock className="size-4 text-warning" />
                Upcoming Deadlines
              </h3>

              {upcomingDeadlines.length === 0 ? (
                <Empty className="py-6">
                  <Empty.Icon>
                    <Calendar className="size-6" />
                  </Empty.Icon>
                  <Empty.Title className="text-sm">No deadlines</Empty.Title>
                  <Empty.Description className="text-xs">
                    Add tasks to see upcoming deadlines
                  </Empty.Description>
                </Empty>
              ) : (
                <div className="flex flex-col gap-2">
                  {upcomingDeadlines.map((assignment) => {
                    const urgency = calculateUrgency(new Date(assignment.dueDate))
                    const daysLeft = differenceInDays(
                      new Date(assignment.dueDate),
                      new Date()
                    )

                    return (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between rounded-lg border p-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {assignment.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {assignment.subject}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            'ml-2 shrink-0 text-xs',
                            urgency.level === 'urgent' && 'border-destructive text-destructive',
                            urgency.level === 'high' && 'border-urgent text-urgent',
                            urgency.level === 'medium' && 'border-warning text-warning-foreground'
                          )}
                        >
                          {daysLeft < 0
                            ? 'Overdue'
                            : daysLeft === 0
                            ? 'Today'
                            : daysLeft === 1
                            ? 'Tomorrow'
                            : `${daysLeft}d`}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
