'use client'

import * as React from 'react'
import { Plus, ListFilter, ClipboardList } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { AssignmentCard } from './assignment-card'
import { AddTaskDialog } from './add-task-dialog'
import { useAssignmentsContext } from '@/lib/store'
import { Assignment } from '@/lib/types'

export function TaskList() {
  const {
    addAssignment,
    updateAssignment,
    deleteAssignment,
    toggleComplete,
    getUpcomingAssignments,
    getCompletedAssignments,
    getSubjects,
  } = useAssignmentsContext()

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Assignment | null>(null)
  const [subjectFilter, setSubjectFilter] = React.useState<string>('all')

  const upcomingTasks = getUpcomingAssignments()
  const completedTasks = getCompletedAssignments()
  const subjects = getSubjects()

  const filterTasks = (tasks: Assignment[]) => {
    if (subjectFilter === 'all') return tasks
    return tasks.filter((t) => t.subject === subjectFilter)
  }

  const handleEdit = (assignment: Assignment) => {
    setEditingTask(assignment)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingTask(null)
    }
  }

  const filteredUpcoming = filterTasks(upcomingTasks)
  const filteredCompleted = filterTasks(completedTasks)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>Manage your upcoming and completed tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <ListFilter className="mr-2 size-4" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.name} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 size-4" />
              Add Task
            </Button>
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-4 w-full justify-start">
              <TabsTrigger value="upcoming" className="flex-1 sm:flex-none">
                Upcoming ({filteredUpcoming.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1 sm:flex-none">
                Completed ({filteredCompleted.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-3">
              {filteredUpcoming.length === 0 ? (
                <Empty>
                  <EmptyMedia variant="icon">
                    <ClipboardList className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>No upcoming tasks</EmptyTitle>
                  <EmptyDescription>
                    {subjectFilter !== 'all'
                      ? 'No tasks found for this subject. Try a different filter.'
                      : 'Add your first assignment to get started.'}
                  </EmptyDescription>
                  {subjectFilter === 'all' && (
                    <EmptyContent>
                      <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 size-4" />
                        Add Task
                      </Button>
                    </EmptyContent>
                  )}
                </Empty>
              ) : (
                filteredUpcoming.map((task) => (
                  <AssignmentCard
                    key={task.id}
                    assignment={task}
                    onToggleComplete={toggleComplete}
                    onDelete={deleteAssignment}
                    onEdit={handleEdit}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3">
              {filteredCompleted.length === 0 ? (
                <Empty>
                  <EmptyMedia variant="icon">
                    <ClipboardList className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>No completed tasks</EmptyTitle>
                  <EmptyDescription>
                    Tasks you complete will appear here.
                  </EmptyDescription>
                </Empty>
              ) : (
                filteredCompleted.map((task) => (
                  <AssignmentCard
                    key={task.id}
                    assignment={task}
                    onToggleComplete={toggleComplete}
                    onDelete={deleteAssignment}
                    onEdit={handleEdit}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AddTaskDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        onAddTask={addAssignment}
        editingTask={editingTask}
        onUpdateTask={updateAssignment}
      />
    </>
  )
}
