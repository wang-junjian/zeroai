'use client'

import React from 'react'
import type { StepStatus } from '@/types'

/**
 * 步骤指示器的步骤类型
 */
interface Step {
  number: number
  name: string
  status: StepStatus
}

/**
 * 步骤指示器组件属性
 */
interface StepIndicatorProps {
  steps: Step[]
  onStepClick?: (stepNumber: number, hasContent: boolean) => void
  selectedStep?: number | null
}

/**
 * 步骤状态配置
 */
const STEP_STATUS_CONFIG = {
  pending: {
    color: 'bg-gray-300',
    labelColor: 'text-gray-500',
    icon: null,
  },
  generating: {
    color: 'bg-gradient-to-r from-indigo-500 to-violet-500 ring-4 ring-indigo-200 animate-pulse',
    labelColor: 'text-indigo-600 font-semibold',
    icon: '⚡',
  },
  reviewing: {
    color: 'bg-gradient-to-r from-amber-500 to-yellow-500 ring-4 ring-amber-200',
    labelColor: 'text-amber-600 font-semibold',
    icon: '⏳',
  },
  approved: {
    color: 'bg-gradient-to-r from-green-500 to-emerald-500 ring-4 ring-green-200',
    labelColor: 'text-green-600 font-semibold',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  failed: {
    color: 'bg-gradient-to-r from-red-500 to-rose-500 ring-4 ring-red-200',
    labelColor: 'text-red-600 font-semibold',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
} as const

/**
 * 步骤指示器组件
 * 显示开发流程中的所有步骤及其状态
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  onStepClick,
  selectedStep,
}) => {
  /**
   * 获取步骤图标
   */
  const getStepIcon = (status: StepStatus, stepNumber: number) => {
    const config = STEP_STATUS_CONFIG[status]
    if (config.icon) return config.icon
    return <span className="text-lg font-bold">{stepNumber}</span>
  }

  /**
   * 获取步骤样式类
   */
  const getStepClasses = (status: StepStatus, isSelected: boolean) => {
    const baseClasses = 'w-14 h-14 rounded-full flex items-center justify-center font-bold text-white mb-3 transition-all duration-300'
    const statusClasses = STEP_STATUS_CONFIG[status].color
    const selectedClasses = isSelected ? 'ring-4 ring-indigo-400 scale-110' : ''

    return `${baseClasses} ${statusClasses} ${selectedClasses}`
  }

  /**
   * 获取标签样式类
   */
  const getLabelClasses = (status: StepStatus, isSelected: boolean) => {
    const baseClasses = 'text-sm font-medium transition-colors duration-300'
    const statusClasses = STEP_STATUS_CONFIG[status].labelColor
    const selectedClasses = isSelected ? 'text-indigo-600 font-bold' : ''

    return `${baseClasses} ${selectedClasses || statusClasses}`
  }

  /**
   * 检查步骤及之前的所有步骤是否都已审批通过
   */
  const isStepApproved = (index: number) => {
    return steps.slice(0, index + 1).every(s => s.status === 'approved')
  }

  /**
   * 检查步骤是否有内容
   */
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

/**
 * 导出 StepStatus 类型以保持向后兼容
 */
export type { StepStatus }
