import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/database'
import {
  createProjectVersion,
  getProjectVersions
} from '@/lib/project-db'

// 确保数据库初始化
initDatabase()

// 获取项目版本列表
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const versions = getProjectVersions(code)
    return NextResponse.json({ versions })
  } catch (error) {
    console.error('获取版本列表失败:', error)
    return NextResponse.json(
      { error: '获取版本列表失败' },
      { status: 500 }
    )
  }
}

// 创建或更新项目版本（版本号相同时覆盖）
export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()
    const { versionNumber, versionName } = body

    const version = createProjectVersion(
      code,
      versionNumber,
      versionName
    )

    return NextResponse.json({ version })
  } catch (error) {
    console.error('保存版本失败:', error)
    return NextResponse.json(
      { error: '保存版本失败' },
      { status: 500 }
    )
  }
}
