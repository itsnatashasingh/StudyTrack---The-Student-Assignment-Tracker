'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Assignment, ReminderFrequency, REMINDER_FREQUENCY_LABELS } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTask: (task: Omit<Assignment, 'id' | 'createdAt' | 'completed'>) => void
  editingTask?: Assignment | null
  onUpdateTask?: (id: string, updates: Partial<Assignment>) => void
}

const COMMON_SUBJECTS = [
  'Mathematics',
  'English',
  'Science',
  'History',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Literature',
  'Art',
]

export function AddTaskDialog({
  open,
  onOpenChange,
  onAddTask,
  editingTask,
  onUpdateTask,
}: AddTaskDialogProps) {
  const [title, setTitle] = React.useState('')
  const [subject, setSubject] = React.useState('')
  const [customSubject, setCustomSubject] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [dueDate, setDueDate] = React.useState<Date>()
  const [reminderFrequency, setReminderFrequency] = React.useState<ReminderFrequency>('daily')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const isEditing = !!editingTask

  React.useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description || '')
      setDueDate(new Date(editingTask.dueDate))
      setReminderFrequency(editingTask.reminderFrequency)
      
      if (COMMON_SUBJECTS.includes(editingTask.subject)) {
        setSubject(editingTask.subject)
        setCustomSubject('')
      } else {
        setSubject('other')
        setCustomSubject(editingTask.subject)
      }
    } else {
      resetForm()
    }
  }, [editingTask, open])

  const resetForm = () => {
    setTitle('')
    setSubject('')
    setCustomSubject('')
    setDescription('')
    setDueDate(undefined)
    setReminderFrequency('daily')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const finalSubject = subject === 'other' ? customSubject : subject

    if (!title.trim() || !finalSubject.trim() || !dueDate) {
      toast.error('Please fill in all required fields')
      return
    }

    if (isEditing && onUpdateTask) {
      onUpdateTask(editingTask.id, {
        title: title.trim(),
        subject: finalSubject.trim(),
        description: description.trim() || undefined,
        dueDate,
        reminderFrequency,
        priority: editingTask.priority,
      })
      toast.success('Task updated successfully')
    } else {
      onAddTask({
        title: title.trim(),
        subject: finalSubject.trim(),
        description: description.trim() || undefined,
        dueDate,
        reminderFrequency,
        priority: 'medium',
      })
      toast.success('Task added successfully')
    }

    resetForm()
    onOpenChange(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Handle text/markdown files for task import
    if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        if (content) {
          // Try to parse title from first line
          const lines = content.split('\n').filter((l) => l.trim())
          if (lines.length > 0) {
            setTitle(lines[0].replace(/^#\s*/, '').trim())
            if (lines.length > 1) {
              setDescription(lines.slice(1).join('\n').trim())
            }
          }
          toast.success('File content imported')
        }
      }
      reader.readAsText(file)
    } else {
      toast.error('Please upload a .txt or .md file')
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the task details below.'
              : 'Add a new assignment to track. You can also upload a file to import task details.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Task Title *</FieldLabel>
              <Input
                id="title"
                placeholder="e.g., Chapter 5 Essay"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="subject">Subject *</FieldLabel>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject" className="w-full">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other...</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {subject === 'other' && (
              <Field>
                <FieldLabel htmlFor="customSubject">Custom Subject *</FieldLabel>
                <Input
                  id="customSubject"
                  placeholder="Enter subject name"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                />
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                placeholder="Add any additional details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </Field>

            <Field>
              <FieldLabel>Due Date *</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Pick a due date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field>
              <FieldLabel htmlFor="reminder">Reminder Frequency</FieldLabel>
              <Select
                value={reminderFrequency}
                onValueChange={(value) => setReminderFrequency(value as ReminderFrequency)}
              >
                <SelectTrigger id="reminder" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REMINDER_FREQUENCY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {!isEditing && (
              <Field>
                <FieldLabel>Import from File</FieldLabel>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 size-4" />
                    Upload .txt or .md
                  </Button>
                </div>
              </Field>
            )}
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Update Task' : 'Add Task'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
