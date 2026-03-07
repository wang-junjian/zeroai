'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { InfoPanel, type StepDetail } from '@/components/features/info-panel'
import type { Step } from '../types'

interface StepContentProps {
  step: Step
  viewMode: 'simple' | 'detail'
  onRegenerate: () => void
  onApprove: () => void
  onNext?: () => void
  isLast: boolean
}

export const StepContent: React.FC<StepContentProps> = ({
  step,
  viewMode,
  onRegenerate,
  onApprove,
  onNext,
  isLast
}) => {
  const content = step.data
  if (!content) return null

  if (viewMode === 'detail' && step.detail) {
    return (
      // 关键：外层加一个 h-full，确保 InfoPanel 能拿满父级高度
      <div className="h-full w-full">
        <InfoPanel stepDetail={step.detail as StepDetail} defaultActiveTab="input" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="bg-gray-50 border border-gray-200 rounded-xl flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 prose prose-sm md:prose-base max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          onClick={onRegenerate}
          variant="outline"
          className="flex-1"
        >
          🔄 重新生成
        </Button>
        {!isLast ? (
          <Button
            onClick={() => {
              onApprove()
              onNext?.()
            }}
            className="flex-1"
          >
            ➡️ 下一步
          </Button>
        ) : (
          <Button
            onClick={onApprove}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
          >
            ✅ 完成
          </Button>
        )}
      </div>
    </div>
  )
}
