'use client'

import React from 'react'

export type StepStatus = 'pending' | 'generating' | 'reviewing' | 'approved' | 'failed'

interface Step {
  number: number
  name: string
  status: StepStatus
}

interface StepIndicatorProps {
  steps: Step[]
  onStepClick?: (stepNumber: number, hasContent: boolean) => void
  selectedStep?: number | null
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  onStepClick,
  selectedStep,
}) => {
  const getStepIcon = (status: StepStatus, stepNumber: number) => {
    switch (status) {
      case 'approved':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'generating':
        return <div className="w-6 h-6">⚡</div>
      case 'reviewing':
        return <div className="w-6 h-6">⏳</div>
      case 'failed':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return <span className="text-lg font-bold">{stepNumber}</span>
    }
  }

  const getStepClasses = (status: StepStatus, isSelected: boolean) => {
    const baseClasses = 'w-14 h-14 rounded-full flex items-center justify-center font-bold text-white mb-3 transition-all duration-300'
    const statusClasses = {
      pending: 'bg-gray-300',
      generating: 'bg-gradient-to-r from-indigo-500 to-violet-500 ring-4 ring-indigo-200 animate-pulse',
      reviewing: 'bg-gradient-to-r from-amber-500 to-yellow-500 ring-4 ring-amber-200',
      approved: 'bg-gradient-to-r from-green-500 to-emerald-500 ring-4 ring-green-200',
      failed: 'bg-gradient-to-r from-red-500 to-rose-500 ring-4 ring-red-200',
    }
    const selectedClasses = isSelected ? 'ring-4 ring-indigo-400 scale-110' : ''

    return `${baseClasses} ${statusClasses[status]} ${selectedClasses}`
  }

  const getLabelClasses = (status: StepStatus, isSelected: boolean) => {
    const baseClasses = 'text-sm font-medium transition-colors duration-300'
    const statusClasses = {
      pending: 'text-gray-500',
      generating: 'text-indigo-600 font-semibold',
      reviewing: 'text-amber-600 font-semibold',
      approved: 'text-green-600 font-semibold',
      failed: 'text-red-600 font-semibold',
    }
    const selectedClasses = isSelected ? 'text-indigo-600 font-bold' : ''

    return `${baseClasses} ${selectedClasses || statusClasses[status]}`
  }

  const isStepApproved = (index: number) => {
    return steps.slice(0, index + 1).every(s => s.status === 'approved')
  }

  const hasStepContent = (status: StepStatus) => {
    return status !== 'pending'
  }

  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const isSelected = selectedStep === step.number
        const hasContent = hasStepContent(step.status)

        return (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex flex-col items-center ${hasContent && onStepClick ? 'cursor-pointer' : ''}`}
              onClick={() => hasContent && onStepClick?.(step.number, hasContent)}
            >
              <div className={getStepClasses(step.status, isSelected)}>
                {getStepIcon(step.status, step.number)}
              </div>
              <span className={getLabelClasses(step.status, isSelected)}>
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-4">
                <div
                  className={`h-full transition-all duration-500 ${
                    isStepApproved(index) ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200'
                  }`}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
