import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/database'
import { getAllProjects } from '@/lib/project-db'

// 确保数据库初始化
initDatabase()

// 获取所有项目列表
export async function GET() {
  try {
    const projects = getAllProjects()
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('获取项目列表失败:', error)
    return NextResponse.json(
      { error: '获取项目列表失败' },
      { status: 500 }
    )
  }
}