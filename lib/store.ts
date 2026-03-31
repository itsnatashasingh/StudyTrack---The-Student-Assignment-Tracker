'use client'

import { createContext, useContext } from 'react'
import useSWR from 'swr'
import { Assignment, Subject, getSubjectColor } from './types'

const STORAGE_KEY = 'studytrack-assignments'

function getStoredAssignments(): Assignment[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  try {
    const parsed = JSON.parse(stored)
    return parsed.map((a: Assignment) => ({
      ...a,
      dueDate: new Date(a.dueDate),
      createdAt: new Date(a.createdAt),
      lastReminded: a.lastReminded ? new Date(a.lastReminded) : undefined,
    }))
  } catch {
    return []
  }
}

function saveAssignments(assignments: Assignment[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments))
}

export function useAssignments() {
  const { data: assignments = [], mutate } = useSWR<Assignment[]>(
    'assignments',
    getStoredAssignments,
    {
      fallbackData: [],
      revalidateOnFocus: false,
    }
  )

  const addAssignment = (assignment: Omit<Assignment, 'id' | 'createdAt' | 'completed'>) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      completed: false,
    }
    const updated = [...assignments, newAssignment]
    saveAssignments(updated)
    mutate(updated)
    return newAssignment
  }

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    const updated = assignments.map((a) => (a.id === id ? { ...a, ...updates } : a))
    saveAssignments(updated)
    mutate(updated)
  }

  const deleteAssignment = (id: string) => {
    const updated = assignments.filter((a) => a.id !== id)
    saveAssignments(updated)
    mutate(updated)
  }

  const toggleComplete = (id: string) => {
    const assignment = assignments.find((a) => a.id === id)
    if (assignment) {
      updateAssignment(id, { completed: !assignment.completed })
    }
  }

  const markReminded = (id: string) => {
    updateAssignment(id, { lastReminded: new Date() })
  }

  const getSubjects = (): Subject[] => {
    const subjectMap = new Map<string, Subject>()

    assignments.forEach((assignment) => {
      const existing = subjectMap.get(assignment.subject)
      if (existing) {
        existing.totalTasks++
        if (assignment.completed) existing.completedTasks++
      } else {
        subjectMap.set(assignment.subject, {
          name: assignment.subject,
          color: getSubjectColor(assignment.subject),
          totalTasks: 1,
          completedTasks: assignment.completed ? 1 : 0,
        })
      }
    })

    return Array.from(subjectMap.values())
  }

  const getUpcomingAssignments = () => {
    return assignments
      .filter((a) => !a.completed)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }

  const getCompletedAssignments = () => {
    return assignments
      .filter((a) => a.completed)
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
  }

  return {
    assignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    toggleComplete,
    markReminded,
    getSubjects,
    getUpcomingAssignments,
    getCompletedAssignments,
  }
}

export const AssignmentsContext = createContext<ReturnType<typeof useAssignments> | null>(null)

export function useAssignmentsContext() {
  const context = useContext(AssignmentsContext)
  if (!context) {
    throw new Error('useAssignmentsContext must be used within AssignmentsProvider')
  }
  return context
}
