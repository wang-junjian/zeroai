'use client'

import { useState, useEffect, useCallback } from 'react'
import type { StepDetail } from '@/types'
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
    {
      number: 1,
      name: stepNames[0],
      status: 'pending',
      data: '请输入项目需求描述',
      detail: {
        stepNumber: 1,
        stepName: stepNames[0],
        systemPrompt: systemPrompts[0],
        userPrompt: '',
        input: requirements,  // Step 1 的 input 显示项目需求
        output: '',
        rawResponse: null,
        timing: undefined
      }
    },
    { number: 2, name: stepNames[1], status: 'pending', data: '点击"生成"开始此步骤', detail: { stepNumber: 2, stepName: stepNames[1], systemPrompt: systemPrompts[1], userPrompt: '', input: '', output: '', rawResponse: null, timing: undefined } },
    { number: 3, name: stepNames[2], status: 'pending', data: '点击"生成"开始此步骤', detail: { stepNumber: 3, stepName: stepNames[2], systemPrompt: systemPrompts[2], userPrompt: '', input: '', output: '', rawResponse: null, timing: undefined } },
    { number: 4, name: stepNames[3], status: 'pending', data: '点击"生成"开始此步骤', detail: { stepNumber: 4, stepName: stepNames[3], systemPrompt: systemPrompts[3], userPrompt: '', input: '', output: '', rawResponse: null, timing: undefined } },
    { number: 5, name: stepNames[4], status: 'pending', data: '点击"生成"开始此步骤', detail: { stepNumber: 5, stepName: stepNames[4], systemPrompt: systemPrompts[4], userPrompt: '', input: '', output: '', rawResponse: null, timing: undefined } }
  ])
  const [currentOutput, setCurrentOutput] = useState('')
  const [showCurrentOutput, setShowCurrentOutput] = useState(false)
  const [selectedStep, setSelectedStep] = useState<number | null>(1)
  const [versions, setVersions] = useState<any[]>([])
  const [selectedVersion, setSelectedVersion] = useState<any>(null)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // 加载项目数据
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        const response = await fetch(`/api/projects/${params.code}`)
        if (response.ok) {
          const result = await response.json()

          // 加载版本
          setVersions(result.versions)

          // 加载项目信息
          if (result.project) {
            setProjectName(result.project.name)
            setRequirements(result.project.requirements)
            setCurrentStep(result.project.current_step)
          }

          // 加载步骤信息
          if (result.steps && result.steps.length > 0) {
            const loadedSteps = result.steps.map((dbStep: any) => {
              const stepNumber = dbStep.step_number
              return {
                number: stepNumber,
                name: stepNames[stepNumber - 1],
                status: dbStep.status,
                data: dbStep.data,
                rawContent: dbStep.raw_content,
                detail: {
                  stepNumber: dbStep.step_number,
                  stepName: dbStep.step_name,
                  systemPrompt: dbStep.system_prompt || systemPrompts[stepNumber - 1],
                  userPrompt: dbStep.user_prompt || '',
                  input: dbStep.input || '',
                  output: dbStep.output || '',
                  rawResponse: dbStep.raw_response ? JSON.parse(dbStep.raw_response) : null,
                  timing: dbStep.timing ? JSON.parse(dbStep.timing) : undefined
                }
              }
            })

            // 如果项目存在并且步骤1没有 input，则使用 project.requirements 填充
            if (result.project && result.project.requirements) {
              const step1 = loadedSteps.find((s: any) => s.number === 1)
              if (step1 && (!step1.detail || !step1.detail.input)) {
                step1.detail = step1.detail || {}
                step1.detail.input = result.project.requirements
                step1.userPrompt = step1.userPrompt || result.project.requirements
                step1.data = step1.data || '点击"生成"开始此步骤'
              }
            }

            // 确保所有5个步骤都有数据
            const completeSteps = [...Array(5)].map((_, index) => {
              const stepNumber = index + 1
              const existingStep = loadedSteps.find((s: any) => s.number === stepNumber)

              if (existingStep) {
                return existingStep
              }

              return {
                number: stepNumber,
                name: stepNames[index],
                status: 'pending',
                data: stepNumber === 1 ? '请输入项目需求描述' : '点击"生成"开始此步骤',
                detail: {
                  stepNumber: stepNumber,
                  stepName: stepNames[index],
                  systemPrompt: systemPrompts[index],
                  userPrompt: '',
                  input: '',
                  output: '',
                  rawResponse: null,
                  timing: undefined
                }
              }
            })

            setSteps(completeSteps)
          }

          // 加载日志
          if (result.logs && result.logs.length > 0) {
            // 这里需要根据日志类型调整，可能需要修改 useLogs 钩子
            console.log('加载到日志:', result.logs)
          }
        }
        setIsDataLoaded(true)
      } catch (error) {
        console.error('加载项目数据失败:', error)
        setIsDataLoaded(true)
      }
    }

    loadProjectData()
  }, [params.code])

  // 自动保存项目数据到数据库
  useEffect(() => {
    if (!isDataLoaded) return

    const saveProjectData = async () => {
      try {
        // 将前端 Step 格式转换为数据库格式
        const dbSteps = steps.map(step => ({
          step_number: step.number,
          step_name: step.name,
          status: step.status,
          data: step.data || '',
          raw_content: step.rawContent,
          system_prompt: step.detail?.systemPrompt,
          user_prompt: step.detail?.userPrompt,
          input: step.detail?.input,
          output: step.detail?.output,
          raw_response: step.detail?.rawResponse ? JSON.stringify(step.detail.rawResponse) : null,
          timing: step.detail?.timing ? JSON.stringify(step.detail.timing) : null
        }))

        await fetch(`/api/projects/${params.code}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project: {
              name: projectName,
              requirements,
              current_step: currentStep,
              status: 'active'
            },
            steps: dbSteps
          })
        })
      } catch (error) {
        console.error('自动保存失败:', error)
      }
    }

    // 防抖：延迟 1 秒保存
    const timeoutId = setTimeout(saveProjectData, 1000)
    return () => clearTimeout(timeoutId)
  }, [steps, projectName, requirements, currentStep, params.code, isDataLoaded])

  useEffect(() => {
    const name = searchParams.get('name')
    const req = searchParams.get('req')
    if (name) setProjectName(safeDecodeURIComponent(name))
    if (req) {
      const decodedReq = safeDecodeURIComponent(req)
      setRequirements(decodedReq)
      setSteps(prev => prev.map(step =>
        step.number === 1 ? {
          ...step,
          status: 'pending',
          detail: {
            ...step.detail!,
            input: decodedReq,
            userPrompt: decodedReq
          },
          data: '点击"生成"开始此步骤'
        } : step
      ))
    }
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

      const systemPrompt = step.detail?.systemPrompt || systemPrompts[stepNum - 1]

      if (stepNum === 1) {
        endpoint = apiEndpoints[0]
        inputContent = step.detail?.input || requirements
        body = {
          description: inputContent,
          systemPrompt: systemPrompt
        }
        inputDesc = '用户需求描述'
      } else if (stepNum === 2) {
        endpoint = apiEndpoints[1]
        inputContent = step.detail?.input || steps[0].rawContent || ''
        body = {
          requirements: inputContent,
          systemPrompt: systemPrompt
        }
        inputDesc = '需求理解结果'
      } else if (stepNum === 3) {
        endpoint = apiEndpoints[2]
        const reqContent = step.detail?.input || steps[0].rawContent || ''
        const intContent = steps[1].rawContent || ''
        inputContent = `需求理解结果：\n${reqContent}\n\n接口设计参考：\n${intContent}`
        body = {
          requirements: inputContent,
          systemPrompt: systemPrompt
        }
        inputDesc = '需求理解结果 + 接口设计'
      } else if (stepNum === 4) {
        endpoint = apiEndpoints[3]
        const intContent = step.detail?.input || steps[1].rawContent || ''
        const dbContent = steps[2].rawContent || ''
        inputContent = `接口设计结果：\n${intContent}\n\n数据库设计参考：\n${dbContent}`
        body = {
          interfaces: inputContent,
          systemPrompt: systemPrompt
        }
        inputDesc = '接口设计结果 + 数据库设计'
      } else if (stepNum === 5) {
        endpoint = apiEndpoints[4]
        const reqContent = step.detail?.input || steps[0].rawContent || ''
        const intContent = steps[1].rawContent || ''
        const blContent = steps[3].rawContent || ''
        inputContent = `需求理解：${reqContent?.substring(0, 200) || '无'}...\n\n接口设计：${intContent?.substring(0, 200) || '无'}...\n\n业务逻辑：${blContent?.substring(0, 200) || '无'}...`
        body = {
          requirements: reqContent,
          interfaces: intContent,
          businessLogic: blContent,
          systemPrompt: systemPrompt
        }
        inputDesc = '需求理解、接口设计、业务逻辑设计结果'
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
        systemPrompt: systemPrompt,
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
      addLog('info', '步骤 ' + stepNum + ' 生成完成', `⏱️ 开始时间：${startTime.toLocaleTimeString()}
✅ 结束时间：${endTime.toLocaleTimeString()}
⚡ 耗时：${duration}ms`)

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
        systemPrompt: step.detail?.systemPrompt || systemPrompts[stepNum - 1],
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

  const goToNextStep = useCallback((stepNum: number) => {
    // 审核当前步骤
    approveStep(stepNum)

    // 设置下一步骤为待生成状态，让用户可以查看提示和输入
    if (stepNum < 5) {
      // 准备输入内容
      let inputContent = ''
      if (stepNum === 1) {
        // 步骤2需要步骤1的输出
        inputContent = steps[0].detail?.output || ''
      } else if (stepNum === 2) {
        // 步骤3需要步骤1和步骤2的输出
        const step1Out = steps[0].detail?.output || ''
        const step2Out = steps[1].detail?.output || ''
        inputContent = `需求理解结果：\n${step1Out}\n\n接口设计参考：\n${step2Out}`
      } else if (stepNum === 3) {
        // 步骤4需要步骤2和步骤3的输出
        const step2Out = steps[1].detail?.output || ''
        const step3Out = steps[2].detail?.output || ''
        inputContent = `接口设计结果：\n${step2Out}\n\n数据库设计参考：\n${step3Out}`
      } else if (stepNum === 4) {
        // 步骤5需要步骤1、2、3、4的输出
        const step1Out = steps[0].detail?.output || ''
        const step2Out = steps[1].detail?.output || ''
        const step3Out = steps[2].detail?.output || ''
        const step4Out = steps[3].detail?.output || ''
        inputContent = `需求理解：\n${step1Out}\n\n接口设计：\n${step2Out}\n\n数据库设计：\n${step3Out}\n\n业务逻辑：\n${step4Out}`
      }

      setSteps(prev => prev.map(s =>
        s.number === stepNum + 1 ? {
          ...s,
          status: 'pending',
          data: '点击"生成"开始此步骤',
          detail: {
            stepNumber: stepNum + 1,
            stepName: stepNames[stepNum],
            systemPrompt: systemPrompts[stepNum],
            userPrompt: inputContent,
            input: inputContent,
            output: '',
            rawResponse: null,
            timing: undefined
          }
        } : s
      ))
      setSelectedStep(stepNum + 1)
      addLog('info', '进入步骤 ' + (stepNum + 1) + '：' + stepNames[stepNum])
    }
  }, [approveStep, addLog, steps])

  // 更新步骤详细信息（由 InfoPanel 编辑回调调用）
  const updateStepDetail = useCallback((stepNum: number, partial: Partial<StepDetail>) => {
    // 构建新的 steps 数组并同步到本地状态
    setSteps(prev => {
      const newSteps = prev.map(s => {
        if (s.number !== stepNum) return s
        const newDetail = {
          ...s.detail,
          ...partial
        }
        const newData = partial.output ?? s.data
        const newRawContent = partial.output ?? s.rawContent
        return {
          ...s,
          data: newData,
          rawContent: newRawContent,
          detail: newDetail
        }
      })

      // 异步保存到后端（仅作为即时持久化，不阻塞 UI）
      ;(async () => {
        try {
          // 将前端 Step 格式转换为数据库格式
          const dbSteps = newSteps.map(step => ({
            step_number: step.number,
            step_name: step.name,
            status: step.status,
            data: step.data || '',
            raw_content: step.rawContent,
            system_prompt: step.detail?.systemPrompt,
            user_prompt: step.detail?.userPrompt,
            input: step.detail?.input,
            output: step.detail?.output,
            raw_response: step.detail?.rawResponse ? JSON.stringify(step.detail?.rawResponse) : null,
            timing: step.detail?.timing ? JSON.stringify(step.detail?.timing) : null
          }))

          await fetch(`/api/projects/${params.code}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project: {
                name: projectName,
                requirements,
                current_step: currentStep,
                status: 'active'
              },
              steps: dbSteps
            })
          })
        } catch (error) {
          addLog('error', `保存步骤 ${stepNum} 到后端失败: ${(error as any).message || error}`)
        }
      })()

      addLog('info', `步骤 ${stepNum} 内容已更新`)
      return newSteps
    })
  }, [addLog])

  // 创建版本（版本号相同时覆盖）
  const createVersion = useCallback(async (versionNumber: string, versionName: string) => {
    try {
      const response = await fetch(`/api/projects/${params.code}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionNumber,
          versionName
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '保存版本失败')
      }

      const result = await response.json()
      // 更新版本列表，找到并替换相同版本号的版本
      setVersions(prev => {
        const index = prev.findIndex(v => v.version_number === versionNumber)
        const newVersion = result.version
        if (index !== -1) {
          const updatedVersions = [...prev]
          updatedVersions[index] = newVersion
          return updatedVersions
        }
        return [newVersion, ...prev]
      })
    } catch (error) {
      console.error('保存版本失败:', error)
      throw error
    }
  }, [params.code])

  // 加载版本
  const loadVersion = useCallback(async (version: any) => {
    try {
      setSelectedVersion(version)
      addLog('info', `加载版本 ${version.version_number}${version.version_name ? ` - ${version.version_name}` : ''}`)

      // 解析版本快照
      const projectSnapshot = JSON.parse(version.project_snapshot)
      const stepsSnapshot = JSON.parse(version.steps_snapshot)

      // 更新项目信息
      setProjectName(projectSnapshot.name)
      setRequirements(projectSnapshot.requirements)
      setCurrentStep(projectSnapshot.current_step)

      // 更新步骤信息
      const loadedSteps = stepsSnapshot.map((dbStep: any) => {
        const stepNumber = dbStep.step_number
        return {
          number: stepNumber,
          name: stepNames[stepNumber - 1],
          status: dbStep.status,
          data: dbStep.data,
          rawContent: dbStep.raw_content,
          detail: {
            stepNumber: dbStep.step_number,
            stepName: dbStep.step_name,
            systemPrompt: dbStep.system_prompt || systemPrompts[stepNumber - 1],
            userPrompt: dbStep.user_prompt || '',
            input: dbStep.input || '',
            output: dbStep.output || '',
            rawResponse: dbStep.raw_response ? JSON.parse(dbStep.raw_response) : null,
            timing: dbStep.timing ? JSON.parse(dbStep.timing) : undefined
          }
        }
      })

      // 确保所有5个步骤都有数据
      const completeSteps = [...Array(5)].map((_, index) => {
        const stepNumber = index + 1
        const existingStep = loadedSteps.find((s: any) => s.number === stepNumber)

        if (existingStep) {
          return existingStep
        }

        return {
          number: stepNumber,
          name: stepNames[index],
          status: 'pending',
          data: stepNumber === 1 ? '请输入项目需求描述' : '点击"生成"开始此步骤',
          detail: {
            stepNumber: stepNumber,
            stepName: stepNames[index],
            systemPrompt: systemPrompts[index],
            userPrompt: '',
            input: '',
            output: '',
            rawResponse: null,
            timing: undefined
          }
        }
      })

      setSteps(completeSteps)
      addLog('info', '版本加载成功！')
    } catch (error) {
      console.error('加载版本失败:', error)
      addLog('error', '加载版本失败: ' + (error as any).message)
    }
  }, [params.code, addLog])

  // 创建新版本（重置到初始状态，保留需求理解阶段的输入）
  const createNewVersion = useCallback(async (versionNumber: string, versionName: string) => {
    try {
      // 重置项目到初始状态，保留需求理解阶段的输入
      const initialSteps: Step[] = [
        {
          number: 1,
          name: stepNames[0],
          status: 'pending',
          data: '请输入项目需求描述',
          detail: {
            stepNumber: 1,
            stepName: stepNames[0],
            systemPrompt: systemPrompts[0],
            userPrompt: requirements, // 保留需求理解阶段的输入
            input: requirements, // 保留需求理解阶段的输入
            output: '',
            rawResponse: null,
            timing: undefined
          }
        },
        { number: 2, name: stepNames[1], status: 'pending', data: '点击"生成"开始此步骤', detail: { stepNumber: 2, stepName: stepNames[1], systemPrompt: systemPrompts[1], userPrompt: '', input: '', output: '', rawResponse: null, timing: undefined } },
        { number: 3, name: stepNames[2], status: 'pending', data: '点击"生成"开始此步骤', detail: { stepNumber: 3, stepName: stepNames[2], systemPrompt: systemPrompts[2], userPrompt: '', input: '', output: '', rawResponse: null, timing: undefined } },
        { number: 4, name: stepNames[3], status: 'pending', data: '点击"生成"开始此步骤', detail: { stepNumber: 4, stepName: stepNames[3], systemPrompt: systemPrompts[3], userPrompt: '', input: '', output: '', rawResponse: null, timing: undefined } },
        { number: 5, name: stepNames[4], status: 'pending', data: '点击"生成"开始此步骤', detail: { stepNumber: 5, stepName: stepNames[4], systemPrompt: systemPrompts[4], userPrompt: '', input: '', output: '', rawResponse: null, timing: undefined } }
      ]

      setSteps(initialSteps)
      setCurrentStep(-1)
      setSelectedStep(1)
      setShowCurrentOutput(false)
      clearLogs()
      addLog('info', '项目已重置到初始状态，开始新的版本开发')

      // 创建新版本
      const response = await fetch(`/api/projects/${params.code}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionNumber,
          versionName
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '保存版本失败')
      }

      const result = await response.json()
      // 更新版本列表
      setVersions(prev => {
        const index = prev.findIndex(v => v.version_number === versionNumber)
        const newVersion = result.version
        if (index !== -1) {
          const updatedVersions = [...prev]
          updatedVersions[index] = newVersion
          return updatedVersions
        }
        return [newVersion, ...prev]
      })

      setSelectedVersion(result.version)
      addLog('info', `新版本 ${versionNumber}${versionName ? ` - ${versionName}` : ''} 创建成功！`)
    } catch (error) {
      console.error('创建新版本失败:', error)
      addLog('error', '创建新版本失败: ' + (error as any).message)
      throw error
    }
  }, [params.code, addLog, clearLogs, requirements])

  const startProject = useCallback(async () => {
    if (isRunning) return
    setIsRunning(true)
    clearLogs()
    setSteps([
      {
        number: 1,
        name: stepNames[0],
        status: 'pending',
        data: '请输入项目需求描述',
        detail: {
          stepNumber: 1,
          stepName: stepNames[0],
          systemPrompt: systemPrompts[0],
          userPrompt: '',
          input: '',
          output: '',
          rawResponse: null,
          timing: undefined
        }
      },
      { number: 2, name: stepNames[1], status: 'pending', data: '点击"生成"开始此步骤', detail: { stepNumber: 2, stepName: stepNames[1], systemPrompt: systemPrompts[1], userPrompt: '', input: '', output: '', rawResponse: null, timing: undefined } },
      { number: 3, name: stepNames[2], status: 'pending', data: '点击"生成"开始此步骤', detail: { stepNumber: 3, stepName: stepNames[2], systemPrompt: systemPrompts[2], userPrompt: '', input: '', output: '', rawResponse: null, timing: undefined } },
      { number: 4, name: stepNames[3], status: 'pending', data: '点击"生成"开始此步骤', detail: { stepNumber: 4, stepName: stepNames[3], systemPrompt: systemPrompts[3], userPrompt: '', input: '', output: '', rawResponse: null, timing: undefined } },
      { number: 5, name: stepNames[4], status: 'pending', data: '点击"生成"开始此步骤', detail: { stepNumber: 5, stepName: stepNames[4], systemPrompt: systemPrompts[4], userPrompt: '', input: '', output: '', rawResponse: null, timing: undefined } }
    ])
    addLog('info', '工作流准备完成！请查看第一步的系统提示，输入项目需求后点击"生成"按钮。')
    setIsRunning(false)
  }, [isRunning, clearLogs, addLog])

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
    logs,
    logsExpanded,
    setLogsExpanded,
    addLog,
    clearLogs,
    startStep,
    regenerateStep,
    approveStep,
    goToNextStep,
    updateStepDetail,
    startProject,
    versions,
    selectedVersion,
    createVersion,
    createNewVersion,
    loadVersion
  }
}
