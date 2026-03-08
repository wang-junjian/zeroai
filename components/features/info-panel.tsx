'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import type { StepDetail } from '@/types'

/**
 * 导出 StepDetail 类型以保持向后兼容
 */
export type { StepDetail } from '@/types'

/**
 * 信息面板组件属性
 */
interface InfoPanelProps {
  stepDetail: StepDetail
  defaultActiveTab?: 'input' | 'output' | 'system' | 'response'
  onRegenerate?: () => void
  onApprove?: () => void
  onNext?: () => void
  isLast?: boolean
  onChangeDetail?: (partial: Partial<StepDetail>) => void
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
  onChangeDetail,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultActiveTab)
  const [viewMode, setViewMode] = useState<ViewMode>('rendered')
  // 记录上一次的步骤编号，用于判断是否切换了步骤
  const [lastStepNumber, setLastStepNumber] = useState(stepDetail.stepNumber)
  // 使用本地状态来管理编辑的内容
  const [editableContent, setEditableContent] = useState<{ [key in TabType]: string }>({
    system: stepDetail.systemPrompt || '',
    input: stepDetail.input || '',
    output: stepDetail.output || '',
    response: stepDetail.rawResponse
      ? JSON.stringify(stepDetail.rawResponse, null, 2)
      : ''
  })

  const debounceRef = useRef<number | null>(null)

  const flushChange = useCallback((tab: TabType, value: string) => {
    if (!onChangeDetail) return

    if (tab === 'system') {
      onChangeDetail({ systemPrompt: value })
    } else if (tab === 'input') {
      onChangeDetail({ input: value, userPrompt: value })
    } else if (tab === 'output') {
      onChangeDetail({ output: value })
    } else if (tab === 'response') {
      try {
        const parsed = JSON.parse(value)
        onChangeDetail({ rawResponse: parsed })
      } catch (err) {
        // 无效 JSON，不回传
      }
    }
  }, [onChangeDetail])

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
    }
  }, [])

  // 当步骤改变时，更新状态
  useEffect(() => {
    // 当步骤的关键内容发生变化时（如 input/output/rawResponse），同步到本地 editableContent
    // 保持对用户正在编辑同一步骤时不被覆盖的保护：当且仅当步骤编号变化或后端数据发生变化且不等于本地内容时更新
    const currentResponse = stepDetail.rawResponse ? JSON.stringify(stepDetail.rawResponse, null, 2) : ''
    const inputChanged = stepDetail.input !== editableContent.input
    const outputChanged = stepDetail.output !== editableContent.output
    const responseChanged = currentResponse !== editableContent.response

    if (stepDetail.stepNumber !== lastStepNumber || inputChanged || outputChanged || responseChanged) {
      if (stepDetail.output && defaultActiveTab === 'output') {
        setActiveTab('output')
      } else {
        setActiveTab(defaultActiveTab)
      }
      setEditableContent({
        system: stepDetail.systemPrompt || '',
        input: stepDetail.input || '',
        output: stepDetail.output || '',
        response: currentResponse
      })
      setLastStepNumber(stepDetail.stepNumber)
    }
  }, [stepDetail.stepNumber, stepDetail.input, stepDetail.output, stepDetail.rawResponse, defaultActiveTab, editableContent, lastStepNumber])

  const getTabContent = () => {
    return editableContent[activeTab]
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
              ✅ 审核
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

      {/* 内容区域 */}
      <div className="flex-1 min-h-0 animate-fade-in overflow-hidden">
        {viewMode === 'raw' || isJson ? (
          <textarea
              value={content}
              onChange={(e) => {
                const v = e.target.value
                // 只更新本地状态，避免编辑时触发不必要的重新渲染
                setEditableContent(prev => ({
                  ...prev,
                  [activeTab]: v
                }))

                // 去抖回传到父组件（如果提供了回调）
                if (debounceRef.current) {
                  window.clearTimeout(debounceRef.current)
                }
                // 使用 number 类型的定时器 id
                debounceRef.current = window.setTimeout(() => {
                  flushChange(activeTab, v)
                }, 800) as unknown as number
              }}
              className="w-full h-full p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
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
