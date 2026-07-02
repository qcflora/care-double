export interface Caregiver {
  id: string
  name: string
  avatar: string
  role: 'primary' | 'assistant' | 'remote' | 'professional'
  roleLabel: string
  isOnDuty: boolean
}

export interface GuideStep {
  id: string
  title: string
  description: string
  tip?: string
}

export interface CareTask {
  id: string
  title: string
  type: 'medication' | 'turning' | 'feeding' | 'hygiene' | 'vitals' | 'activity'
  time: string
  period: 'morning' | 'noon' | 'evening' | 'night'
  completed: boolean
  steps: GuideStep[]
}

export interface HandoffRecord {
  id: string
  fromName: string
  toName: string
  time: string
  pendingTasks: string[]
  medicationNotes: string
  dietNotes: string
  moodNotes: string
  healthNotes: string
  abnormalItems: string[]
}

export interface ElderProfile {
  name: string
  age: number
  gender: string
  conditions: string[]
  medications: string[]
  careLevel: string
}

export type CareRole = 'primary' | 'assistant' | 'remote' | 'professional'
export type LoadLevel = 'low' | 'medium' | 'high'
