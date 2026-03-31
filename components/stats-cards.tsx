'use client'

import { ClipboardList, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAssignmentsContext } from '@/lib/store'
import { calculateUrgency } from '@/lib/types'

export function StatsCards() {
  const { assignments, getUpcomingAssignments } = useAssignmentsContext()

  const totalTasks = assignments.length
  const completedTasks = assignments.filter((a) => a.completed).length
  const pendingTasks = totalTasks - completedTasks
  const urgentTasks = getUpcomingAssignments().filter(
    (a) => calculateUrgency(new Date(a.dueDate)).level === 'urgent'
  ).length

  const stats = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: ClipboardList,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Pending',
      value: pendingTasks,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Urgent',
      value: urgentTasks,
      icon: AlertTriangle,
      color: 'text-urgent',
      bgColor: 'bg-urgent/10',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="py-4">
          <CardContent className="flex items-center gap-4">
            <div className={`flex size-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`size-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
