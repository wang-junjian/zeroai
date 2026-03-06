'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { StepIndicator } from '@/components/features/step-indicator'
import { useProjectDetail } from './hooks/useProjectDetail'
import { StepContent } from './components/StepContent'
import { LogDisplay } from './components/LogDisplay'
import { ViewToggle } from './components/ViewToggle'

export default function ProjectDetail() {
  const {
    projectName,
    isRunning,
    steps,
    selectedStep,
    setSelectedStep,
    currentOutput,
    showCurrentOutput,
    viewMode,
    setViewMode,
    logs,
    logsExpanded,
    setLogsExpanded,
    regenerateStep,
    approveStep,
    startStep,
    startProject
  } = useProjectDetail()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
            <span>←</span>
            <span className="font-medium">返回</span>
          </Link>
          <h1 className="text-2xl font-bold text-gradient">
            项目：{projectName}
          </h1>
          <div className="flex items-center gap-3">
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />

            {!isRunning && steps.every(s => s.status === 'pending') && (
              <Button onClick={startProject} className="shadow-lg hover:shadow-xl">
                开始生成
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardBody className="p-6">
            <StepIndicator
              steps={steps}
              selectedStep={selectedStep}
              onStepClick={setSelectedStep}
            />
          </CardBody>
        </Card>

        {showCurrentOutput && steps.some(s => s.status === 'generating') && (
          <Card className="mb-8 animate-fade-in">
            <CardBody className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                正在生成：{steps.find(s => s.status === 'generating')?.name}
              </h2>
              <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm text-green-400 h-80 overflow-y-auto relative">
                <pre className="whitespace-pre-wrap">{currentOutput}</pre>
                <div className="absolute bottom-4 left-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    <span className="text-gray-400">AI 正在思考...</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {selectedStep && (() => {
          const step = steps.find(s => s.number === selectedStep)
          if (!step || !step.data) return null
          return (
            <Card key={'selected-' + step.number} highlight={true} className="mb-8 animate-fade-in">
              <CardBody className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gradient">
                    📋 {step.name}
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedStep(null)}
                  >
                    ×
                  </Button>
                </div>
                <StepContent
                  step={step}
                  viewMode={viewMode}
                  onRegenerate={() => regenerateStep(step.number)}
                  onApprove={() => approveStep(step.number)}
                  onNext={() => startStep(step.number + 1)}
                  isLast={step.number === 5}
                />
              </CardBody>
            </Card>
          )
        })()}

        {!selectedStep && steps.map(step => step.status === 'reviewing' && (
          <Card key={step.number} className="mb-8 animate-fade-in">
            <CardBody className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {step.name}
              </h2>
              <StepContent
                step={step}
                viewMode={viewMode}
                onRegenerate={() => regenerateStep(step.number)}
                onApprove={() => approveStep(step.number)}
                onNext={() => startStep(step.number + 1)}
                isLast={step.number === 5}
              />
            </CardBody>
          </Card>
        ))}

        <Card className="mt-8">
          <CardBody className="p-6">
            <LogDisplay
              logs={logs}
              logsExpanded={logsExpanded}
              setLogsExpanded={setLogsExpanded}
              projectName={projectName}
            />
          </CardBody>
        </Card>
      </main>
    </div>
  )
}
