'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { InfoPanel, type StepDetail } from '@/components/features/info-panel'
import type { Step } from '../types'

interface StepContentProps {
  step: Step
  onRegenerate: () => void
  onApprove: () => void
  onNext?: () => void
  isLast: boolean
}

export const StepContent: React.FC<StepContentProps> = ({
  step,
  onRegenerate,
  onApprove,
  onNext,
  isLast
}) => {
  const content = step.data
  if (!content) return null

  // 对于已完成的步骤（approved），只显示渲染的输出信息
  if (step.status === 'approved') {
    return (
      <div className="h-full w-full flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6
          prose prose-sm max-w-none
          prose-headings:font-semibold prose-headings:text-gray-900
          prose-h1:text-xl prose-h1:mb-4
          prose-h2:text-lg prose-h2:mb-3 prose-h2:mt-6
          prose-h3:text-base prose-h3:mb-2 prose-h3:mt-4
          prose-p:text-gray-700 prose-p:leading-relaxed
          prose-pre:bg-gray-900 prose-pre:text-gray-100
          prose-pre:rounded-lg prose-pre:p-4
          prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-code:before:content-none prose-code:after:content-none
          prose-pre:code:bg-transparent prose-pre:code:p-0
          prose-ul:my-2 prose-li:my-0.5
          prose-table:border-collapse prose-table:w-full
          prose-th:bg-gray-100 prose-th:border prose-th:px-3 prose-th:py-2
          prose-td:border prose-td:px-3 prose-td:py-2
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    )
  }

  // 对于其他状态，显示完整的详细视图
  return (
    <div className="h-full w-full">
      <InfoPanel
        stepDetail={step.detail as StepDetail}
        defaultActiveTab="input"
        onRegenerate={onRegenerate}
        onApprove={onApprove}
        onNext={onNext}
        isLast={isLast}
      />
    </div>
  )
}
