// API 路由通用工具函数

import { NextResponse, NextRequest } from 'next/server'
import type { ApiResponse } from '@/types'

/**
 * 成功响应
 */
export function successResponse<T>(data: T, msg: string = '调用成功'): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    code: '000000',
    msg,
    data,
  })
}

/**
 * 错误响应
 */
export function errorResponse(msg: string = '系统错误', code: string = '000001', status: number = 500): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      code,
      msg,
      data: null,
    },
    { status }
  )
}

/**
 * API 路由处理器包装器
 * 自动处理错误和响应格式
 */
export function createApiHandler<T>(
  handler: (req: NextRequest) => Promise<T>
) {
  return async function (req: NextRequest) {
    try {
      const data = await handler(req)
      return successResponse(data)
    } catch (error) {
      console.error('API Error:', error)
      const errorMsg = error instanceof Error ? error.message : '系统错误'
      return errorResponse(errorMsg)
    }
  }
}

/**
 * 验证请求参数
 */
export function validateRequest<T>(req: NextRequest, requiredFields: (keyof T)[]): Promise<T> {
  return req.json().then((data) => {
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        throw new Error(`缺少必需参数: ${String(field)}`)
      }
    }
    return data as T
  })
}
