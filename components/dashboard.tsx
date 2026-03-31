'use client'

import * as React from 'react'
import { Header } from './header'
import { StatsCards } from './stats-cards'
import { SubjectProgress } from './subject-progress'
import { TaskList } from './task-list'
import { RemindersPanel } from './reminders-panel'
import { useAssignments, AssignmentsContext } from '@/lib/store'
import { useNotifications } from '@/hooks/use-notifications'

export function Dashboard() {
  const assignmentsStore = useAssignments()
  const [isRemindersOpen, setIsRemindersOpen] = React.useState(false)

  // Initialize notification system
  useNotifications(assignmentsStore.assignments, assignmentsStore.markReminded)

  return (
    <AssignmentsContext.Provider value={assignmentsStore}>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header onOpenReminders={() => setIsRemindersOpen(true)} />

        <main className="container mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Track your assignments and stay ahead of deadlines
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <StatsCards />

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TaskList />
              </div>
              <div className="lg:col-span-1">
                <SubjectProgress />
              </div>
            </div>
          </div>
        </main>

        <RemindersPanel open={isRemindersOpen} onOpenChange={setIsRemindersOpen} />
      </div>
    </AssignmentsContext.Provider>
  )
}
