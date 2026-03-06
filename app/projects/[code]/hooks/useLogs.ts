'use client'

import { useState, useCallback } from 'react'
import type { LogEntry } from '../types'

export function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logsExpanded, setLogsExpanded] = useState(false)

  const addLog = useCallback((level: 'info' | 'warn' | 'error', message: string, details?: string) => {
    setLogs(prev => [...prev, {
      id: 'log-' + Date.now() + '-' + Math.random(),
      timestamp: new Date(),
      level,
      message,
      details
    }])
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return {
    logs,
    logsExpanded,
    setLogsExpanded,
    addLog,
    clearLogs
  }
}
