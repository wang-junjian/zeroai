// 项目核心类型定义文件

/**
 * 步骤状态类型
 */
export type StepStatus = 'pending' | 'generating' | 'reviewing' | 'approved' | 'failed'

/**
 * 项目步骤详细信息
 */
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

/**
 * 项目步骤
 */
export interface Step {
  number: number
  name: string
  status: StepStatus
  data?: any
  rawContent?: string
  detail?: StepDetail
}

/**
 * 项目日志条目
 */
export interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error'
  message: string
  details?: string
}

/**
 * 项目信息
 */
export interface Project {
  code: string
  name: string
  requirements: string
  current_step: number
  status: string
}

/**
 * 项目版本
 */
export interface ProjectVersion {
  id: number
  project_code: string
  version_number: string
  version_name?: string
  is_published: number
  project_snapshot: string
  steps_snapshot: string
  create_time?: Date
  publish_time?: Date
}

/**
 * API 响应格式
 */
export interface ApiResponse<T = any> {
  code: string
  msg: string
  data: T
}

/**
 * 项目服务状态类型
 */
export type ProjectStatus = 'draft' | 'active' | 'completed' | 'failed'

/**
 * 步骤类型
 */
export type StepType = 1 | 2 | 3 | 4 | 5

/**
 * 通用响应状态码
 */
export const ResponseCodes = {
  SUCCESS: '000000',
  ERROR: '000001',
  VALIDATION_ERROR: '000002',
  NOT_FOUND: '000003',
} as const

/**
 * 通用响应消息
 */
export const ResponseMessages = {
  SUCCESS: '调用成功',
  ERROR: '系统错误',
  VALIDATION_ERROR: '参数验证失败',
  NOT_FOUND: '资源未找到',
} as const
