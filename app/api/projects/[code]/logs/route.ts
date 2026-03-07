import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/database'
import {
  getProjectLogs,
  createProjectLog,
  clearProjectLogs
} from '@/lib/project-db'

initDatabase()

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const logs = getProjectLogs(code)
    return NextResponse.json({ logs })
  } catch (error) {
    console.error('获取日志失败:', error)
    return NextResponse.json(
      { error: '获取日志失败' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()
    const { level, title, content } = body

    const log = createProjectLog({
      project_code: code,
      level,
      title,
      content
    })

    return NextResponse.json({ log })
  } catch (error) {
    console.error('创建日志失败:', error)
    return NextResponse.json(
      { error: '创建日志失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    clearProjectLogs(code)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('清空日志失败:', error)
    return NextResponse.json(
      { error: '清空日志失败' },
      { status: 500 }
    )
  }
}
