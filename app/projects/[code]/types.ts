import type { StepStatus } from '@/components/features/step-indicator'
import type { StepDetail } from '@/components/features/info-panel'

/**
 * 项目步骤 - 表示五步开发流程中的一个步骤
 */
export interface Step {
  /** 步骤编号 1-5 */
  number: number
  /** 步骤名称 */
  name: string
  /** 步骤状态 */
  status: StepStatus
  /** 主要数据（通常是 Markdown 格式的内容） */
  data?: any
  /** 原始内容 */
  rawContent?: string
  /** 步骤详情（包含 AI 调用信息） */
  detail?: StepDetail
}

/**
 * 项目日志条目 - 记录开发过程中的操作日志
 */
export interface LogEntry {
  /** 日志唯一 ID */
  id: string
  /** 时间戳 */
  timestamp: Date
  /** 日志级别 */
  level: 'info' | 'warn' | 'error'
  /** 日志消息 */
  message: string
  /** 详细内容（可选） */
  details?: string
}
