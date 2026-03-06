'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// 安全的 URI 解码函数
function safeDecodeURIComponent(encoded: string): string {
  try {
    return decodeURIComponent(encoded)
  } catch (e) {
    return encoded.replace(/%([0-9A-Fa-f]{2})/g, (match, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16))
      } catch {
        return match
      }
    })
  }
}

interface Step {
  number: number
  name: string
  status: 'pending' | 'generating' | 'reviewing' | 'approved' | 'failed'
  data?: any
  rawContent?: string
}

interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error'
  message: string
}

const stepNames = ['需求理解', '接口设计', '表结构设计', '处理逻辑设计', '代码生成']

export default function ProjectDetail() {
  const params = useParams()
  const searchParams = useSearchParams()
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
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [currentOutput, setCurrentOutput] = useState('')
  const [showCurrentOutput, setShowCurrentOutput] = useState(false)
  const [selectedStep, setSelectedStep] = useState<number | null>(null)

  useEffect(() => {
    const name = searchParams.get('name')
    const req = searchParams.get('req')
    if (name) setProjectName(safeDecodeURIComponent(name))
    if (req) setRequirements(safeDecodeURIComponent(req))
  }, [searchParams])

  const addLog = (level: 'info' | 'warn' | 'error', message: string) => {
    setLogs(prev => [...prev, {
      id: 'log-' + Date.now() + '-' + Math.random(),
      timestamp: new Date(),
      level,
      message
    }])
  }

  // 解析 JSON（智能提取）
  const parseJSONSmart = (text: string): any => {
    try {
      return JSON.parse(text)
    } catch (e) {
      // 尝试找到第一个 { 和最后一个 }
      const firstBrace = text.indexOf('{')
      const lastBrace = text.lastIndexOf('}')
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonText = text.substring(firstBrace, lastBrace + 1)
        try {
          return JSON.parse(jsonText)
        } catch (e2) {
          console.error('JSON 解析失败:', e2)
        }
      }
      throw e
    }
  }

  // 调用 API 路由生成内容
  const generateContent = async (stepNum: number, previousData?: any): Promise<any> => {
    setShowCurrentOutput(true)
    setCurrentOutput('')

    let displayContent = '正在调用 API...\n'
    setCurrentOutput(displayContent)

    try {
      let response: Response
      let endpoint = ''
      let body: any = {}

      if (stepNum === 1) {
        endpoint = '/api/analyze'
        body = { description: requirements }
      } else if (stepNum === 2) {
        endpoint = '/api/design/interfaces'
        body = { requirements: steps[0].rawContent }
      } else if (stepNum === 3) {
        endpoint = '/api/design/database'
        body = { requirements: steps[0].rawContent }
      } else if (stepNum === 4) {
        endpoint = '/api/design/business-logic'
        body = { interfaces: steps[1].rawContent }
      } else if (stepNum === 5) {
        endpoint = '/api/generate/code'
        body = {
          requirements: steps[0].rawContent,
          interfaces: steps[1].rawContent,
          businessLogic: steps[3].rawContent
        }
      }

      displayContent += '\n发送请求到 ' + endpoint + '...\n'
      setCurrentOutput(displayContent)

      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      displayContent += '\n收到 API 响应...\n'
      setCurrentOutput(displayContent)

      const result = await response.json()

      if (result.code !== '000000') {
        throw new Error(result.msg || 'API 调用失败')
      }

      displayContent += '\n✅ 生成成功！\n'
      displayContent += '\n' + result.data
      setCurrentOutput(displayContent)

      // 直接存储原始文本内容
      return { data: result.data, rawContent: result.data }
    } catch (error) {
      displayContent += '\n❌ API 调用失败: ' + (error as any).message + '\n'
      displayContent += '\n使用模拟数据作为备用...\n'
      setCurrentOutput(displayContent)

      // 模拟数据作为备用
      await new Promise(r => setTimeout(r, 500))

      let fallbackContent: string
      if (stepNum === 1) {
        fallbackContent = `# 需求分析结果

## 项目概述
- 项目名称：${projectName}
- 项目类型：web_app
- 描述：一个基于用户需求的全栈应用

## 功能需求
1. FR-001 - 用户认证模块：用户注册、登录、登出功能
2. FR-002 - 数据管理模块：数据的增删改查操作
3. FR-003 - 用户界面模块：美观的响应式界面

## 非功能需求
1. NFR-001 - 性能：页面加载时间 < 2秒`
      } else if (stepNum === 2) {
        fallbackContent = `# 接口设计结果

## 服务模块
1. 用户认证模块 - 处理用户注册和登录
2. 数据管理模块 - 处理数据 CRUD

## API 接口
1. POST /api/auth/register - 用户注册
2. POST /api/auth/login - 用户登录
3. GET /api/data - 获取数据列表
4. POST /api/data - 创建数据
5. PUT /api/data/:id - 更新数据
6. DELETE /api/data/:id - 删除数据`
      } else if (stepNum === 3) {
        fallbackContent = `# 数据库设计结果

## 表结构

### users 表
\`\`\`sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### data 表
\`\`\`sql
CREATE TABLE data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
\`\`\``
      } else if (stepNum === 4) {
        fallbackContent = `# 业务逻辑设计结果

## 用户注册接口
- 入参：username, email, password
- 处理逻辑：
  1. 验证用户名和邮箱是否已存在
  2. 加密密码
  3. 创建用户记录
  4. 返回用户信息（不含密码）

## 用户登录接口
- 入参：email, password
- 处理逻辑：
  1. 根据邮箱查找用户
  2. 验证密码
  3. 生成会话 token
  4. 返回 token 和用户信息

## 数据 CRUD 接口
- 创建：验证权限，创建记录
- 读取：验证权限，返回数据
- 更新：验证权限，更新记录
- 删除：验证权限，删除记录`
      } else {
        fallbackContent = `# 代码生成结果

## 项目结构
\`\`\`
/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   └── data/route.ts
│   ├── page.tsx
│   └── layout.tsx
├── lib/
│   ├── db.ts
│   └── auth.ts
└── package.json
\`\`\`

## 核心文件示例

### app/api/auth/login/route.ts
\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const user = await db.users.findUnique({ where: { email } });

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = createToken(user.id);
  return NextResponse.json({ token, user: { id: user.id, username: user.username, email: user.email } });
}
\`\`\``
      }

      displayContent += '\n使用模拟数据完成！\n'
      displayContent += '\n' + fallbackContent
      setCurrentOutput(displayContent)

      return { data: fallbackContent, rawContent: fallbackContent }
    }
  }

  const startStep = async (stepNum: number) => {
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
      const result = await generateContent(stepNum)

      setSteps(prev => prev.map(s =>
        s.number === stepNum ? {
          ...s,
          status: 'reviewing',
          data: result.data
        } : s
      ))
      addLog('info', '步骤 ' + stepNum + ' 生成完成')
    } catch (error) {
      setSteps(prev => prev.map(s =>
        s.number === stepNum ? { ...s, status: 'failed' } : s
      ))
      addLog('error', '步骤 ' + stepNum + ' 生成失败: ' + error)
    } finally {
      setCurrentStep(-1)
    }
  }

  const regenerateStep = async (stepNum: number) => {
    await startStep(stepNum)
  }

  const approveStep = (stepNum: number) => {
    setSteps(prev => prev.map(s =>
      s.number === stepNum ? { ...s, status: 'approved' } : s
    ))
    setShowCurrentOutput(false)
    addLog('info', '步骤 ' + stepNum + ' 审核通过！')
  }

  const renderReviewContent = (step: Step) => {
    const content = step.data
    if (!content) return null

    return (
      <div className="space-y-4">
        {/* 直接显示原始文本内容 */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="font-mono text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        </div>

        {/* 用户操作按钮 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => regenerateStep(step.number)}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            🔄 重新生成
          </button>
          {step.number < 5 ? (
            <button
              onClick={() => {
                approveStep(step.number)
                startStep(step.number + 1)
              }}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              ➡️ 下一步
            </button>
          ) : (
            <button
              onClick={() => approveStep(step.number)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              ✅ 完成
            </button>
          )}
        </div>
      </div>
    )
  }

  const startProject = async () => {
    if (isRunning) return
    setIsRunning(true)
    setLogs([])
    setSteps([
      { number: 1, name: stepNames[0], status: 'pending' },
      { number: 2, name: stepNames[1], status: 'pending' },
      { number: 3, name: stepNames[2], status: 'pending' },
      { number: 4, name: stepNames[3], status: 'pending' },
      { number: 5, name: stepNames[4], status: 'pending' }
    ])
    addLog('info', '开始工作流...')
    await startStep(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-gray-600">←</span>
            <span className="font-medium">返回</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            项目：{projectName}
          </h1>
          <div className="flex gap-3">
            {!isRunning && steps.every(s => s.status === 'pending') && (
              <button
                onClick={startProject}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                开始生成
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Steps Visualizer */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">五步流程</h2>

          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const statusColors = {
                pending: 'bg-gray-300',
                generating: 'bg-blue-500 animate-pulse',
                reviewing: 'bg-yellow-500 animate-pulse',
                approved: 'bg-green-500',
                failed: 'bg-red-500'
              }
              const statusIcons = {
                pending: step.number,
                generating: '...',
                reviewing: '⏳',
                approved: '✓',
                failed: '✕'
              }
              const isSelected = selectedStep === step.number
              const hasContent = step.status !== 'pending' && step.data
              return (
                <div
                  key={step.number}
                  className={`flex items-center cursor-pointer ${hasContent ? 'hover:opacity-80' : ''}`}
                  onClick={() => hasContent && setSelectedStep(isSelected ? null : step.number)}
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white mb-2 ${statusColors[step.status]} ${isSelected ? 'ring-4 ring-blue-300' : ''}`}>
                      {statusIcons[step.status]}
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                      {step.name}
                    </span>
                  </div>
                  {index < 4 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      steps.slice(0, index + 1).every(s => s.status === 'approved')
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Streaming Output (during generation) */}
        {showCurrentOutput && steps.some(s => s.status === 'generating') && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              正在生成：{steps.find(s => s.status === 'generating')?.name}
            </h2>
            <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-green-400 h-64 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{currentOutput}</pre>
              <div className="animate-pulse inline">▊</div>
            </div>
          </div>
        )}

        {/* Selected Step Content */}
        {selectedStep && (() => {
          const step = steps.find(s => s.number === selectedStep)
          if (!step || !step.data) return null
          return (
            <div key={'selected-' + step.number} className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-blue-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-blue-900">
                  📋 {step.name}
                </h2>
                <button
                  onClick={() => setSelectedStep(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              {renderReviewContent(step)}
            </div>
          )
        })()}

        {/* Review Content (only show if no selected step) */}
        {!selectedStep && steps.map(step => step.status === 'reviewing' && (
          <div key={step.number} className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {step.name}
            </h2>
            {renderReviewContent(step)}
          </div>
        ))}

        {/* Logs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">执行日志</h2>
          <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm max-h-48 overflow-y-auto">
            <div>&gt; 项目：{projectName}</div>
            {logs.map((log) => (
              <div key={log.id} className={
                log.level === 'error' ? 'text-red-400' :
                log.level === 'warn' ? 'text-yellow-400' :
                'text-green-400'
              }>
                {log.timestamp.toLocaleTimeString()} [{log.level.toUpperCase()}] {log.message}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
