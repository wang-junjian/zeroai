import type { StepStatus } from '@/components/features/step-indicator'
import type { StepDetail } from '@/components/features/info-panel'

export interface Step {
  number: number
  name: string
  status: StepStatus
  data?: any
  rawContent?: string
  detail?: StepDetail
}

export interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error'
  message: string
  details?: string
}
