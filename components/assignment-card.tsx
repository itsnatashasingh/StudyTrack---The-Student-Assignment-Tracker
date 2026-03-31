'use client'

import { format } from 'date-fns'
import { Calendar, Clock, Trash2, CheckCircle2, Circle, MoreVertical } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Assignment, calculateUrgency, getSubjectColor, REMINDER_FREQUENCY_LABELS } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AssignmentCardProps {
  assignment: Assignment
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (assignment: Assignment) => void
}

export function AssignmentCard({
  assignment,
  onToggleComplete,
  onDelete,
  onEdit,
}: AssignmentCardProps) {
  const urgency = calculateUrgency(new Date(assignment.dueDate))
  const subjectColor = getSubjectColor(assignment.subject)

  const urgencyStyles = {
    low: 'border-l-success',
    medium: 'border-l-warning',
    high: 'border-l-urgent',
    urgent: 'border-l-destructive',
  }

  const urgencyBadgeStyles = {
    low: 'bg-success/10 text-success hover:bg-success/20',
    medium: 'bg-warning/10 text-warning-foreground hover:bg-warning/20',
    high: 'bg-urgent/10 text-urgent hover:bg-urgent/20',
    urgent: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  }

  const getDueText = () => {
    if (urgency.daysLeft < 0) {
      return `${Math.abs(urgency.daysLeft)} days overdue`
    }
    if (urgency.daysLeft === 0) {
      return 'Due today'
    }
    if (urgency.daysLeft === 1) {
      return 'Due tomorrow'
    }
    return `${urgency.daysLeft} days left`
  }

  return (
    <Card
      className={cn(
        'border-l-4 transition-all hover:shadow-md py-4',
        urgencyStyles[urgency.level],
        assignment.completed && 'opacity-60'
      )}
    >
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="mt-0.5 size-6 shrink-0"
            onClick={() => onToggleComplete(assignment.id)}
          >
            {assignment.completed ? (
              <CheckCircle2 className="size-5 text-success" />
            ) : (
              <Circle className="size-5 text-muted-foreground" />
            )}
            <span className="sr-only">
              {assignment.completed ? 'Mark as incomplete' : 'Mark as complete'}
            </span>
          </Button>

          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={cn(
                  'font-medium leading-tight',
                  assignment.completed && 'line-through text-muted-foreground'
                )}
              >
                {assignment.title}
              </h3>
              <Badge variant="secondary" className="text-xs">
                <div className={cn('size-2 rounded-full mr-1.5', subjectColor)} />
                {assignment.subject}
              </Badge>
            </div>

            {assignment.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {assignment.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
              </span>
              <Badge variant="outline" className={cn('text-xs', urgencyBadgeStyles[urgency.level])}>
                <Clock className="mr-1 size-3" />
                {getDueText()}
              </Badge>
              {assignment.reminderFrequency !== 'none' && (
                <span className="text-xs">
                  Reminders: {REMINDER_FREQUENCY_LABELS[assignment.reminderFrequency]}
                </span>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 shrink-0">
              <MoreVertical className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(assignment)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(assignment.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}
