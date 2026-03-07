import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/database'
import {
  createProjectVersion,
  getProjectVersions,
  publishProjectVersion,
  getProjectVersionById
} from '@/lib/project-db'

initDatabase()

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()
    const { versionNumber, versionName, isPublished } = body

    const version = createProjectVersion(
      code,
      versionNumber,
      versionName,
      isPublished || false
    )

    return NextResponse.json({ version })
  } catch (error) {
    console.error('创建版本失败:', error)
    return NextResponse.json(
      { error: '创建版本失败' },
      { status: 500 }
    )
  }
}

// 发布版本
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const body = await request.json()
    const { id } = body

    const version = publishProjectVersion(id)
    if (!version) {
      return NextResponse.json({ error: '版本不存在' }, { status: 404 })
    }

    return NextResponse.json({ version })
  } catch (error) {
    console.error('发布版本失败:', error)
    return NextResponse.json(
      { error: '发布版本失败' },
      { status: 500 }
    )
  }
}
