'use client'

import React from 'react'
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
  // 如果步骤有输出内容，默认显示输出标签页
  const defaultTab = step.detail?.output ? 'output' : 'input'

  return (
    <div className="h-full w-full">
      <InfoPanel
        stepDetail={step.detail as StepDetail}
        defaultActiveTab={defaultTab}
        onRegenerate={onRegenerate}
        onApprove={onApprove}
        onNext={onNext}
        isLast={isLast}
      />
    </div>
  )
}
