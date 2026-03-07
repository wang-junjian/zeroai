'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'

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
  onRegenerate?: () => void
  onApprove?: () => void
  onNext?: () => void
  isLast?: boolean
}

type TabType = 'input' | 'output' | 'system' | 'response'
type ViewMode = 'rendered' | 'raw'

const tabNames: { key: TabType; label: string; icon: string }[] = [
  { key: 'system', label: '系统提示', icon: '⚙️' },
  { key: 'input', label: '输入', icon: '📥' },
  { key: 'output', label: '输出', icon: '📤' },
  { key: 'response', label: '原始响应', icon: '📊' },
]

const MarkdownRenderer = ({ content }: { content: string }) => {
  if (!content) return <div className="text-gray-400 italic">无内容</div>

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
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

export const InfoPanel: React.FC<InfoPanelProps> = ({
  stepDetail,
  defaultActiveTab = 'input',
  onRegenerate,
  onApprove,
  onNext,
  isLast,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultActiveTab)
  const [viewMode, setViewMode] = useState<ViewMode>('rendered')

  const getTabContent = () => {
    switch (activeTab) {
      case 'input':
        return stepDetail.input || ''
      case 'output':
        return stepDetail.output || ''
      case 'system':
        return stepDetail.systemPrompt || ''
      case 'response':
        return stepDetail.rawResponse
          ? JSON.stringify(stepDetail.rawResponse, null, 2)
          : ''
    }
  }

  const isJson = activeTab === 'response'
  const content = getTabContent()
  const hasOutput = !!stepDetail.output

  return (
    <div className="flex flex-col h-full">
      {/* 标签页导航 */}
      <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
        {tabNames.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 视图切换和操作按钮 */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          {!isJson && (
            <>
              <span className="text-sm text-gray-500 mr-2">查看方式：</span>
              <button
                onClick={() => setViewMode('rendered')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'rendered'
                    ? 'bg-gray-200 text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                渲染视图
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'raw'
                    ? 'bg-gray-200 text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                原始格式
              </button>
            </>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          {onRegenerate && (
            <Button
              onClick={() => {
                setActiveTab('output')
                onRegenerate()
              }}
              size="sm"
            >
              🔄 生成
            </Button>
          )}
          {/* 只有在有输出内容时才显示下一步按钮（待审核状态） */}
          {onApprove && !isLast && onNext && hasOutput && (
            <Button
              onClick={() => {
                onApprove()
                onNext()
              }}
              size="sm"
            >
              ➡️ 下一步
            </Button>
          )}
          {onApprove && isLast && hasOutput && (
            <Button
              onClick={onApprove}
              size="sm"
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              ✅ 完成
            </Button>
          )}
        </div>
      </div>

      {/* 计时信息 */}
      {stepDetail.timing && (
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mb-4 flex-shrink-0">
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
                  耗时：
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
      <div className="flex-1 min-h-0 animate-fade-in overflow-hidden">
        {viewMode === 'raw' || isJson ? (
          <textarea
            value={content}
            readOnly
            className="w-full h-full p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none resize-none"
          />
        ) : (
          <div className="w-full h-full bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
            <MarkdownRenderer content={content} />
          </div>
        )}
      </div>
    </div>
  )
}
