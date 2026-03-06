'use client'

import React, { useState } from 'react'

export interface StepDetail {
  stepNumber: number
  stepName: string
  systemPrompt?: string
  userPrompt?: string
  input?: string
  output?: string
  rawResponse?: any
  timing?: {
    startTime: Date
    endTime?: Date
    duration?: number
  }
}

interface InfoPanelProps {
  stepDetail: StepDetail
  defaultActiveTab?: 'input' | 'output' | 'system' | 'response'
}

type TabType = 'input' | 'output' | 'system' | 'response'

const tabNames: { key: TabType; label: string; icon: string }[] = [
  { key: 'input', label: '输入', icon: '📥' },
  { key: 'output', label: '输出', icon: '📤' },
  { key: 'system', label: '系统提示', icon: '⚙️' },
  { key: 'response', label: '原始响应', icon: '📊' },
]

export const InfoPanel: React.FC<InfoPanelProps> = ({
  stepDetail,
  defaultActiveTab = 'output',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultActiveTab)

  const renderContent = () => {
    switch (activeTab) {
      case 'input':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>📝</span>
              <span>用户输入</span>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {stepDetail.input || '无输入内容'}
              </pre>
            </div>
          </div>
        )
      case 'output':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>✨</span>
              <span>AI 输出</span>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {stepDetail.output || '无输出内容'}
              </pre>
            </div>
          </div>
        )
      case 'system':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>🤖</span>
              <span>系统提示词</span>
            </div>
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {stepDetail.systemPrompt || '无系统提示词'}
              </pre>
            </div>
          </div>
        )
      case 'response':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>📊</span>
              <span>原始响应</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {stepDetail.rawResponse
                  ? JSON.stringify(stepDetail.rawResponse, null, 2)
                  : '无原始响应数据'}
              </pre>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* 标签页导航 */}
      <div className="flex flex-wrap gap-2">
        {tabNames.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 计时信息 */}
      {stepDetail.timing && (
        <div className="flex items-center gap-6 text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <span>⏱️</span>
            <span>开始时间：</span>
            <span className="font-mono text-gray-700">
              {stepDetail.timing.startTime.toLocaleTimeString()}
            </span>
          </div>
          {stepDetail.timing.endTime && (
            <>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>结束时间：</span>
                <span className="font-mono text-gray-700">
                  {stepDetail.timing.endTime.toLocaleTimeString()}
                </span>
              </div>
              {stepDetail.timing.duration && (
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>耗时：</span>
                  <span className="font-mono text-indigo-600 font-semibold">
                    {stepDetail.timing.duration}ms
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 内容区域 */}
      <div className="animate-fade-in">
        {renderContent()}
      </div>
    </div>
  )
}
