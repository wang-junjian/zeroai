'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import type { LogEntry } from '../types'

interface LogDisplayProps {
  logs: LogEntry[]
  logsExpanded: boolean
  setLogsExpanded: (expanded: boolean) => void
  projectName: string
}

export const LogDisplay: React.FC<LogDisplayProps> = ({
  logs,
  logsExpanded,
  setLogsExpanded,
  projectName
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-bold text-gray-900">执行日志</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLogsExpanded(!logsExpanded)}
        >
          {logsExpanded ? '收起' : '展开'}
        </Button>
      </div>

      {logsExpanded && (
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs max-h-48 overflow-y-auto">
          <div className="text-gray-400 mb-2">&gt; 项目：{projectName}</div>
          {logs.map((log) => (
            <div key={log.id} className={
              log.level === 'error' ? 'text-red-400' :
              log.level === 'warn' ? 'text-yellow-400' :
              'text-green-400'
            }>
              {log.timestamp.toLocaleTimeString()} [{log.level.toUpperCase()}] {log.message}
              {log.details && (
                <div className="ml-8 mt-1 text-gray-400 border-l-2 border-gray-600 pl-3">
                  {log.details}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!logsExpanded && (
        <div className="bg-gray-100 rounded-lg p-3 text-gray-600 text-sm">
          执行日志已收起。点击"展开"查看详细信息。
        </div>
      )}
    </>
  )
}
