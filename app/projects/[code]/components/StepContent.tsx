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
  const content = step.data
  if (!content) return null

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
