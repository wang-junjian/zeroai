'use client'

import React from 'react'
import type { Step } from '../types'
import type { StepStatus } from '@/components/features/step-indicator'

interface SidebarProps {
  steps: Step[]
  selectedStep: number | null
  onStepClick: (stepNumber: number) => void
  isRunning: boolean
}

const getStepIcon = (status: StepStatus, stepNumber: number) => {
  switch (status) {
    case 'approved':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    case 'generating':
      return <div className="w-5 h-5 flex items-center justify-center">⚡</div>
    case 'reviewing':
      return <div className="w-5 h-5 flex items-center justify-center">⏳</div>
    case 'failed':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    default:
      return <span className="text-sm font-bold">{stepNumber}</span>
  }
}

const getStatusColor = (status: StepStatus) => {
  switch (status) {
    case 'approved':
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-300',
        iconBg: 'bg-green-500',
      }
    case 'generating':
      return {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-300',
        iconBg: 'bg-gradient-to-r from-indigo-500 to-violet-500',
      }
    case 'reviewing':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-300',
        iconBg: 'bg-gradient-to-r from-amber-500 to-yellow-500',
      }
    case 'failed':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-300',
        iconBg: 'bg-gradient-to-r from-red-500 to-rose-500',
      }
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-500',
        border: 'border-gray-200',
        iconBg: 'bg-gray-300',
      }
  }
}

export const Sidebar: React.FC<SidebarProps> = ({
  steps,
  selectedStep,
  onStepClick,
  isRunning,
}) => {
  const hasStepContent = (status: StepStatus) => {
    return status !== 'pending'
  }

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-base font-bold text-gray-900">开发步骤</h2>
        <p className="text-xs text-gray-500 mt-1">
          {isRunning ? '正在生成中...' : '点击查看已完成的步骤'}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-2">
        {steps.map((step, index) => {
          const isSelected = selectedStep === step.number
          const hasContent = hasStepContent(step.status)
          const colors = getStatusColor(step.status)

          return (
            <div key={step.number}>
              <button
                onClick={() => hasContent && onStepClick(step.number)}
                disabled={!hasContent}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left
                  ${isSelected
                    ? `${colors.bg} ${colors.border} shadow-sm`
                    : hasContent
                      ? 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                      : 'border-transparent opacity-50 cursor-not-allowed'
                  }
                `}
              >
                <div className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0
                  ${colors.iconBg}
                  ${step.status === 'generating' ? 'animate-pulse' : ''}
                  ${isSelected ? 'ring-2 ring-offset-2 ring-gray-400' : ''}
                `}>
                  {getStepIcon(step.status, step.number)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`
                    text-sm font-medium truncate
                    ${isSelected ? colors.text : hasContent ? 'text-gray-700' : 'text-gray-400'}
                  `}>
                    {step.name}
                  </p>
                  <p className={`
                    text-xs mt-0.5
                    ${step.status === 'generating' ? 'text-indigo-500' : 'text-gray-400'}
                  `}>
                    {step.status === 'pending' && '等待中'}
                    {step.status === 'generating' && '生成中...'}
                    {step.status === 'reviewing' && '待审核'}
                    {step.status === 'approved' && '已完成'}
                    {step.status === 'failed' && '失败'}
                  </p>
                </div>
              </button>

              {index < steps.length - 1 && (
                <div className="ml-[22px] my-1 w-px h-3 bg-gray-200" />
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
