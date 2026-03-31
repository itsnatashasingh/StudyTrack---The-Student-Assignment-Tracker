'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAssignmentsContext } from '@/lib/store'
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { BookOpen } from 'lucide-react'

export function SubjectProgress() {
  const { getSubjects } = useAssignmentsContext()
  const subjects = getSubjects()

  if (subjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress by Subject</CardTitle>
          <CardDescription>Track your completion rate for each subject</CardDescription>
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyMedia variant="icon">
              <BookOpen className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No subjects yet</EmptyTitle>
            <EmptyDescription>
              Add your first assignment to see subject progress
            </EmptyDescription>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress by Subject</CardTitle>
        <CardDescription>Track your completion rate for each subject</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          {subjects.map((subject) => {
            const percentage =
              subject.totalTasks > 0
                ? Math.round((subject.completedTasks / subject.totalTasks) * 100)
                : 0

            return (
              <div key={subject.name} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`size-3 rounded-full ${subject.color}`} />
                    <span className="text-sm font-medium">{subject.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {subject.completedTasks}/{subject.totalTasks} ({percentage}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
