'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { useProjectDetail } from './hooks/useProjectDetail'
import { StepContent } from './components/StepContent'
import { LogDisplay } from './components/LogDisplay'
import { Sidebar } from './components/Sidebar'
import { VersionManager } from './components/VersionManager'

export default function ProjectDetail() {
  const {
    projectName,
    isRunning,
    steps,
    selectedStep,
    setSelectedStep,
    currentOutput,
    showCurrentOutput,
    logs,
    logsExpanded,
    setLogsExpanded,
    regenerateStep,
    approveStep,
    goToNextStep,
    startStep,
    startProject,
    versions,
    createVersion,
    selectedVersion,
    loadVersion
  } = useProjectDetail()

  const getDisplayStep = () => {
    if (selectedStep) {
      return steps.find(s => s.number === selectedStep)
    }
    const reviewingStep = steps.find(s => s.status === 'reviewing')
    if (reviewingStep) return reviewingStep
    const generatingStep = steps.find(s => s.status === 'generating')
    if (generatingStep) return generatingStep
    const lastApproved = [...steps].reverse().find(s => s.status === 'approved')
    if (lastApproved) return lastApproved
    // 所有步骤都是 pending 时，返回第一步（需求理解）
    return steps[0]
  }

  const displayStep = getDisplayStep()

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-gray-200 h-16 flex-shrink-0">
        <div className="h-full px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
            <span>←</span>
            <span className="font-medium">返回</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-900 truncate max-w-md">
            {projectName}
          </h1>
          <div className="flex items-center gap-3">
            {/* 隐藏"开始生成"按钮，因为直接进入需求理解步骤 */}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧：步骤侧边栏 */}
        <Sidebar
          steps={steps}
          selectedStep={selectedStep}
          onStepClick={setSelectedStep}
          isRunning={isRunning}
        />

        {/* 中间：内容区域 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto h-full flex flex-col gap-4">
              {showCurrentOutput && steps.some(s => s.status === 'generating') && (
                <Card className="flex-shrink-0">
                  <CardBody className="p-4">
                    <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                      正在生成：{steps.find(s => s.status === 'generating')?.name}
                    </h2>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 h-28 overflow-y-auto relative">
                      <pre className="whitespace-pre-wrap">{currentOutput}</pre>
                      <div className="absolute bottom-3 left-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          <span className="text-gray-400 text-xs">AI 正在思考...</span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {displayStep && displayStep.data ? (
                <Card className="flex-1 flex flex-col min-h-0">
                  <CardBody className="p-4 flex flex-col h-full overflow-hidden">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                      <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                          {displayStep.number}
                        </span>
                        {displayStep.name}
                      </h2>
                      {selectedStep && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedStep(null)}
                          className="h-8 w-8 p-0"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0">
                      <StepContent
                        step={displayStep}
                        onRegenerate={() => regenerateStep(displayStep.number)}
                        onApprove={() => approveStep(displayStep.number)}
                        onNext={() => goToNextStep(displayStep.number)}
                        isLast={displayStep.number === 5}
                      />
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <Card className="flex-1 flex flex-col min-h-0">
                  <CardBody className="p-4 flex flex-col h-full items-center justify-center">
                    <div className="text-gray-400 text-5xl mb-4">📋</div>
                    <h3 className="text-base font-medium text-gray-700 mb-2">
                      等待生成中...
                    </h3>
                    <p className="text-gray-500 text-sm">
                      选择左侧步骤查看详情
                    </p>
                  </CardBody>
                </Card>
              )}

              {/* 日志显示 */}
              <Card className="flex-shrink-0">
                <CardBody className="p-4">
                  <LogDisplay
                    logs={logs}
                    logsExpanded={logsExpanded}
                    setLogsExpanded={setLogsExpanded}
                    projectName={projectName}
                  />
                </CardBody>
              </Card>
            </div>
          </div>
        </main>

        {/* 右侧：版本管理侧边栏 */}
        <div className="w-80 border-l border-gray-200 flex flex-col overflow-hidden bg-white">
          <VersionManager
            versions={versions}
            onCreateVersion={createVersion}
            onLoadVersion={loadVersion}
            selectedVersion={selectedVersion}
          />
        </div>
      </div>
    </div>
  )
}
