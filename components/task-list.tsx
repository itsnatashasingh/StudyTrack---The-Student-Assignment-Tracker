'use client'

import * as React from 'react'
import { Plus, ListFilter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Empty } from '@/components/ui/empty'
import { AssignmentCard } from './assignment-card'
import { AddTaskDialog } from './add-task-dialog'
import { useAssignmentsContext } from '@/lib/store'
import { Assignment } from '@/lib/types'
import { ClipboardList } from 'lucide-react'

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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Assignments</CardTitle>
              <CardDescription>Manage your upcoming and completed tasks</CardDescription>
            </div>
            <CardAction>
              <div className="flex items-center gap-2">
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-[160px]">
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
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 size-4" />
                  Add Task
                </Button>
              </div>
            </CardAction>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-4 w-full justify-start">
              <TabsTrigger value="upcoming" className="flex-1 sm:flex-none">
                Upcoming ({filterTasks(upcomingTasks).length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1 sm:flex-none">
                Completed ({filterTasks(completedTasks).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-3">
              {filterTasks(upcomingTasks).length === 0 ? (
                <Empty>
                  <Empty.Icon>
                    <ClipboardList className="size-8" />
                  </Empty.Icon>
                  <Empty.Title>No upcoming tasks</Empty.Title>
                  <Empty.Description>
                    {subjectFilter !== 'all'
                      ? 'No tasks found for this subject. Try a different filter.'
                      : 'Add your first assignment to get started.'}
                  </Empty.Description>
                  {subjectFilter === 'all' && (
                    <Empty.Actions>
                      <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 size-4" />
                        Add Task
                      </Button>
                    </Empty.Actions>
                  )}
                </Empty>
              ) : (
                filterTasks(upcomingTasks).map((task) => (
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
              {filterTasks(completedTasks).length === 0 ? (
                <Empty>
                  <Empty.Icon>
                    <ClipboardList className="size-8" />
                  </Empty.Icon>
                  <Empty.Title>No completed tasks</Empty.Title>
                  <Empty.Description>
                    Tasks you complete will appear here.
                  </Empty.Description>
                </Empty>
              ) : (
                filterTasks(completedTasks).map((task) => (
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
