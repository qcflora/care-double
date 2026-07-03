import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { CareRole, CareTask, Caregiver, HandoffRecord, ElderProfile, LoadLevel, GuideStep } from '../types'
import { mockTasks, mockCaregivers, mockHandoffs, mockElder } from '../data/mockData'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface AppState {
  isOnboarded: boolean
  userRole: CareRole | null
  tasks: CareTask[]
  caregivers: Caregiver[]
  handoffs: HandoffRecord[]
  elder: ElderProfile
  loadLevel: LoadLevel
  completedTaskIds: string[]
  breatheSessions: number
}

interface AppContextType extends AppState {
  setIsOnboarded: (val: boolean) => void
  setUserRole: (role: CareRole) => void
  completeTask: (taskId: string) => void
  toggleBreatheModal: () => void
  incrementBreathe: () => void
  addHandoff: (handoff: HandoffRecord) => void
  addCaregiver: (name: string, role: CareRole, roleLabel: string) => void
  removeCaregiver: (id: string) => void
  toggleDuty: (id: string) => void
  addTask: (task: Omit<CareTask, 'id' | 'completed'>) => void
  removeTask: (id: string) => void
  updateTask: (id: string, updates: Partial<CareTask>) => void
  resetData: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnboarded, setIsOnboarded] = useLocalStorage<boolean>('zsh_onboarded', false)
  const [userRole, setUserRole] = useLocalStorage<CareRole | null>('zsh_role', null)
  const [tasks, setTasks] = useLocalStorage<CareTask[]>('zsh_tasks', mockTasks)
  const [completedTaskIds, setCompletedTaskIds] = useLocalStorage<string[]>('zsh_completed', [])
  const [breatheSessions, setBreatheSessions] = useLocalStorage<number>('zsh_breathe', 2)
  const [handoffs, setHandoffs] = useLocalStorage<HandoffRecord[]>('zsh_handoffs', mockHandoffs)
  const [caregivers, setCaregivers] = useLocalStorage<Caregiver[]>('zsh_caregivers', mockCaregivers)

  const elder = mockElder

  const loadLevel: LoadLevel = completedTaskIds.length >= 5 ? 'high' : completedTaskIds.length >= 3 ? 'medium' : 'low'

  const completeTask = useCallback((taskId: string) => {
    setTasks((prev: CareTask[]) => prev.map(t => t.id === taskId ? { ...t, completed: true } : t))
    setCompletedTaskIds((prev: string[]) => [...prev, taskId])
  }, [setTasks, setCompletedTaskIds])

  const toggleBreatheModal = useCallback(() => {
  }, [])

  const incrementBreathe = useCallback(() => {
    setBreatheSessions((prev: number) => prev + 1)
  }, [setBreatheSessions])

  const addHandoff = useCallback((handoff: HandoffRecord) => {
    setHandoffs((prev: HandoffRecord[]) => [handoff, ...prev])
  }, [setHandoffs])

  const addCaregiver = useCallback((name: string, role: CareRole, roleLabel: string) => {
    const newCaregiver: Caregiver = {
      id: `c-${Date.now()}`,
      name,
      avatar: '',
      role,
      roleLabel,
      isOnDuty: false,
    }
    setCaregivers((prev: Caregiver[]) => [...prev, newCaregiver])
  }, [setCaregivers])

  const removeCaregiver = useCallback((id: string) => {
    setCaregivers((prev: Caregiver[]) => prev.filter(c => c.id !== id))
  }, [setCaregivers])

  const toggleDuty = useCallback((id: string) => {
    setCaregivers((prev: Caregiver[]) => prev.map(c => ({
      ...c,
      isOnDuty: c.id === id ? !c.isOnDuty : false,
    })))
  }, [setCaregivers])

  const addTask = useCallback((task: Omit<CareTask, 'id' | 'completed'>) => {
    const newTask: CareTask = {
      ...task,
      id: `t-${Date.now()}`,
      completed: false,
    }
    setTasks((prev: CareTask[]) => [...prev, newTask])
  }, [setTasks])

  const removeTask = useCallback((id: string) => {
    setTasks((prev: CareTask[]) => prev.filter(t => t.id !== id))
    setCompletedTaskIds((prev: string[]) => prev.filter(tid => tid !== id))
  }, [setTasks, setCompletedTaskIds])

  const updateTask = useCallback((id: string, updates: Partial<CareTask>) => {
    setTasks((prev: CareTask[]) => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [setTasks])

  const handleSetRole = useCallback((role: CareRole) => {
    setUserRole(role)
    setIsOnboarded(true)
  }, [setUserRole, setIsOnboarded])

  const resetData = useCallback(() => {
    setTasks(mockTasks)
    setCompletedTaskIds([])
    setBreatheSessions(2)
    setHandoffs(mockHandoffs)
    setCaregivers(mockCaregivers)
    setIsOnboarded(false)
    setUserRole(null)
  }, [setTasks, setCompletedTaskIds, setBreatheSessions, setHandoffs, setCaregivers, setIsOnboarded, setUserRole])

  return (
    <AppContext.Provider value={{
      isOnboarded,
      userRole,
      tasks,
      caregivers,
      handoffs,
      elder,
      loadLevel,
      completedTaskIds,
      breatheSessions,
      setIsOnboarded,
      setUserRole: handleSetRole,
      completeTask,
      toggleBreatheModal,
      incrementBreathe,
      addHandoff,
      addCaregiver,
      removeCaregiver,
      toggleDuty,
      addTask,
      removeTask,
      updateTask,
      resetData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
