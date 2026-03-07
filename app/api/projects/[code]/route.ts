import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/database'
import {
  getProjectByCode,
  createProject,
  updateProject,
  getProjectSteps,
  createProjectStep,
  updateProjectStep,
  getProjectVersions,
  createProjectVersion,
  getProjectLogs,
  createProjectLog,
  clearProjectLogs
} from '@/lib/project-db'

// 确保数据库初始化
initDatabase()

// 获取项目
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const project = getProjectByCode(code)
    if (!project) {
      return NextResponse.json({ error: '项目不存在' }, { status: 404 })
    }

    const steps = getProjectSteps(code)
    const versions = getProjectVersions(code)
    const logs = getProjectLogs(code)

    return NextResponse.json({
      project,
      steps,
      versions,
      logs
    })
  } catch (error) {
    console.error('获取项目失败:', error)
    return NextResponse.json(
      { error: '获取项目失败' },
      { status: 500 }
    )
  }
}

// 创建或更新项目
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()
    const { project, steps } = body

    let existingProject = getProjectByCode(code)

    if (existingProject) {
      // 更新项目
      updateProject(code, {
        name: project.name,
        requirements: project.requirements,
        current_step: project.current_step,
        status: project.status
      })
    } else {
      // 创建新项目
      existingProject = createProject({
        code: code,
        name: project.name || code,
        requirements: project.requirements || '',
        current_step: project.current_step || 0,
        status: project.status || 'draft'
      })
    }

    // 更新步骤
    if (steps && steps.length > 0) {
      for (const step of steps) {
        const existingStep = getProjectSteps(code).find(
          s => s.step_number === step.step_number
        )

        if (existingStep) {
          updateProjectStep(code, step.step_number, {
            step_name: step.step_name,
            status: step.status,
            data: step.data,
            raw_content: step.raw_content,
            system_prompt: step.system_prompt,
            user_prompt: step.user_prompt,
            input: step.input,
            output: step.output,
            raw_response: step.raw_response,
            timing: step.timing
          })
        } else {
          createProjectStep({
            project_code: code,
            step_number: step.step_number,
            step_name: step.step_name,
            status: step.status,
            data: step.data,
            raw_content: step.raw_content,
            system_prompt: step.system_prompt,
            user_prompt: step.user_prompt,
            input: step.input,
            output: step.output,
            raw_response: step.raw_response,
            timing: step.timing
          })
        }
      }
    }

    return NextResponse.json({
      project: getProjectByCode(code),
      steps: getProjectSteps(code)
    })
  } catch (error) {
    console.error('更新项目失败:', error)
    return NextResponse.json(
      { error: '更新项目失败' },
      { status: 500 }
    )
  }
}
