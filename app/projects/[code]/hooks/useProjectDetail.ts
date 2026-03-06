'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useLogs } from './useLogs'
import type { Step } from '../types'
import { stepNames, systemPrompts, fallbackContents, apiEndpoints } from '../constants'
import { safeDecodeURIComponent, truncateText } from '../utils'

export function useProjectDetail() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { logs, logsExpanded, setLogsExpanded, addLog, clearLogs } = useLogs()

  const [projectName, setProjectName] = useState('项目')
  const [requirements, setRequirements] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [steps, setSteps] = useState<Step[]>([
    { number: 1, name: stepNames[0], status: 'pending' },
    { number: 2, name: stepNames[1], status: 'pending' },
    { number: 3, name: stepNames[2], status: 'pending' },
    { number: 4, name: stepNames[3], status: 'pending' },
    { number: 5, name: stepNames[4], status: 'pending' }
  ])
  const [currentOutput, setCurrentOutput] = useState('')
  const [showCurrentOutput, setShowCurrentOutput] = useState(false)
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'simple' | 'detail'>('simple')

  useEffect(() => {
    const name = searchParams.get('name')
    const req = searchParams.get('req')
    if (name) setProjectName(safeDecodeURIComponent(name))
    if (req) setRequirements(safeDecodeURIComponent(req))
  }, [searchParams])

  const startStep = useCallback(async (stepNum: number) => {
    const step = steps[stepNum - 1]
    if (step.status === 'approved') {
      addLog('warn', '该步骤已审核通过')
      return
    }

    setCurrentStep(stepNum)
    setSteps(prev => prev.map(s =>
      s.number === stepNum ? { ...s, status: 'generating' } : s
    ))
    addLog('info', '开始生成步骤 ' + stepNum + ': ' + step.name)

    try {
      setShowCurrentOutput(true)
      setCurrentOutput('正在调用 API...\n')

      const startTime = new Date()
      let displayContent = '正在调用 API...\n'
      let inputContent = ''

      let response: Response
      let endpoint = ''
      let body: any = {}
      let inputDesc = ''

      if (stepNum === 1) {
        endpoint = apiEndpoints[0]
        body = { description: requirements }
        inputDesc = '用户需求描述'
        inputContent = requirements
      } else if (stepNum === 2) {
        endpoint = apiEndpoints[1]
        body = { requirements: steps[0].rawContent }
        inputDesc = '需求理解结果'
        inputContent = steps[0].rawContent || '无'
      } else if (stepNum === 3) {
        endpoint = apiEndpoints[2]
        body = { requirements: steps[0].rawContent }
        inputDesc = '需求理解结果'
        inputContent = steps[0].rawContent || '无'
      } else if (stepNum === 4) {
        endpoint = apiEndpoints[3]
        body = { interfaces: steps[1].rawContent }
        inputDesc = '接口设计结果'
        inputContent = steps[1].rawContent || '无'
      } else if (stepNum === 5) {
        endpoint = apiEndpoints[4]
        body = {
          requirements: steps[0].rawContent,
          interfaces: steps[1].rawContent,
          businessLogic: steps[3].rawContent
        }
        inputDesc = '需求理解、接口设计、业务逻辑设计结果'
        inputContent = `需求理解：${steps[0].rawContent?.substring(0, 200) || '无'}...\n\n接口设计：${steps[1].rawContent?.substring(0, 200) || '无'}...\n\n业务逻辑：${steps[3].rawContent?.substring(0, 200) || '无'}...`
      }

      addLog('info', `步骤 ${stepNum} (${stepNames[stepNum - 1]}) - 输入：${inputDesc}`,
        `输入内容预览：${truncateText(inputContent, 300)}`)

      displayContent += '\n发送请求到 ' + endpoint + '...\n'
      setCurrentOutput(displayContent)

      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      displayContent += '\n收到 API 响应...\n'
      setCurrentOutput(displayContent)

      const result = await response.json()
      const endTime = new Date()
      const duration = endTime.getTime() - startTime.getTime()

      if (result.code !== '000000') {
        throw new Error(result.msg || 'API 调用失败')
      }

      displayContent += '\n✅ 生成成功！\n'
      displayContent += '\n' + result.data
      setCurrentOutput(displayContent)

      addLog('info', `步骤 ${stepNum} (${stepNames[stepNum - 1]}) - 输出成功生成`,
        `输出内容预览：${truncateText(result.data, 500)}`)

      const stepDetail = {
        stepNumber: stepNum,
        stepName: stepNames[stepNum - 1],
        systemPrompt: systemPrompts[stepNum - 1],
        userPrompt: inputContent,
        input: inputContent,
        output: result.data,
        rawResponse: result,
        timing: { startTime, endTime, duration }
      }

      setSteps(prev => prev.map(s =>
        s.number === stepNum ? {
          ...s,
          status: 'reviewing',
          data: result.data,
          rawContent: result.data,
          detail: stepDetail
        } : s
      ))
      addLog('info', '步骤 ' + stepNum + ' 生成完成')

    } catch (error) {
      setSteps(prev => prev.map(s =>
        s.number === stepNum ? { ...s, status: 'failed' } : s
      ))
      addLog('error', '步骤 ' + stepNum + ' 生成失败: ' + error)

      const endTime = new Date()

      setShowCurrentOutput(true)
      setCurrentOutput(prev => prev + '\n❌ API 调用失败: ' + (error as any).message + '\n')
      setCurrentOutput(prev => prev + '\n使用模拟数据作为备用...\n')

      addLog('error', `步骤 ${stepNum} (${stepNames[stepNum - 1]}) - API调用失败`,
        (error as any).message)
      addLog('warn', `步骤 ${stepNum} - 使用模拟数据作为备用`, '将生成标准模板内容')

      await new Promise(r => setTimeout(r, 500))

      let fallbackContent = fallbackContents[stepNum - 1]
      if (stepNum === 1) {
        fallbackContent = fallbackContent.replace('{projectName}', projectName)
      }

      setCurrentOutput(prev => prev + '\n使用模拟数据完成！\n')
      setCurrentOutput(prev => prev + '\n' + fallbackContent)

      const stepDetail = {
        stepNumber: stepNum,
        stepName: stepNames[stepNum - 1],
        systemPrompt: systemPrompts[stepNum - 1],
        userPrompt: '',
        input: '',
        output: fallbackContent,
        rawResponse: { data: fallbackContent, code: '000000', msg: 'success' },
        timing: { startTime: new Date(Date.now() - 1000), endTime, duration: 1000 }
      }

      setSteps(prev => prev.map(s =>
        s.number === stepNum ? {
          ...s,
          status: 'reviewing',
          data: fallbackContent,
          rawContent: fallbackContent,
          detail: stepDetail
        } : s
      ))
    } finally {
      setCurrentStep(-1)
    }
  }, [steps, requirements, projectName, addLog])

  const regenerateStep = useCallback(async (stepNum: number) => {
    await startStep(stepNum)
  }, [startStep])

  const approveStep = useCallback((stepNum: number) => {
    setSteps(prev => prev.map(s =>
      s.number === stepNum ? { ...s, status: 'approved' } : s
    ))
    setShowCurrentOutput(false)
    addLog('info', '步骤 ' + stepNum + ' 审核通过！')
  }, [addLog])

  const startProject = useCallback(async () => {
    if (isRunning) return
    setIsRunning(true)
    clearLogs()
    setSteps([
      { number: 1, name: stepNames[0], status: 'pending' },
      { number: 2, name: stepNames[1], status: 'pending' },
      { number: 3, name: stepNames[2], status: 'pending' },
      { number: 4, name: stepNames[3], status: 'pending' },
      { number: 5, name: stepNames[4], status: 'pending' }
    ])
    addLog('info', '开始工作流...')
    await startStep(1)
    setIsRunning(false)
  }, [isRunning, clearLogs, startStep, addLog])

  return {
    projectName,
    requirements,
    isRunning,
    currentStep,
    steps,
    selectedStep,
    setSelectedStep,
    currentOutput,
    showCurrentOutput,
    setShowCurrentOutput,
    viewMode,
    setViewMode,
    logs,
    logsExpanded,
    setLogsExpanded,
    addLog,
    clearLogs,
    startStep,
    regenerateStep,
    approveStep,
    startProject
  }
}
