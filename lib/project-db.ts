import { db } from './database'

// 项目类型定义
export interface Project {
  code: string
  name: string
  requirements: string
  current_step: number
  status: string
  create_time?: Date
  update_time?: Date
}

// 项目步骤类型定义
export interface ProjectStep {
  id?: number
  project_code: string
  step_number: number
  step_name: string
  status: string
  data: string
  raw_content?: string
  system_prompt?: string
  user_prompt?: string
  input?: string
  output?: string
  raw_response?: string
  timing?: string
  create_time?: Date
  update_time?: Date
}

// 项目版本类型定义
export interface ProjectVersion {
  id?: number
  project_code: string
  version_number: string
  version_name?: string
  is_published: number
  project_snapshot: string
  steps_snapshot: string
  create_time?: Date
  publish_time?: Date
}

// 项目日志类型定义
export interface ProjectLog {
  id?: number
  project_code: string
  level: string
  title: string
  content?: string
  create_time?: Date
}

// 创建项目
export function createProject(project: Omit<Project, 'create_time' | 'update_time'>) {
  const stmt = db.prepare(`
    INSERT INTO t_project (
      code, name, requirements, current_step, status
    ) VALUES (?, ?, ?, ?, ?)
  `)

  try {
    stmt.run([
      project.code,
      project.name,
      project.requirements,
      project.current_step,
      project.status
    ])

    return getProjectByCode(project.code)
  } catch (error) {
    console.error('创建项目失败:', error)
    throw error
  }
}

// 获取项目
export function getProjectByCode(code: string) {
  const stmt = db.prepare(`
    SELECT * FROM t_project WHERE code = ?
  `)

  return stmt.get(code) as Project
}

// 更新项目
export function updateProject(code: string, updates: Partial<Project>) {
  const updateFields = Object.keys(updates)
    .filter(key => !['code'].includes(key)) // 不允许更新 code
    .map(key => `${key} = ?`)
    .join(', ')

  const updateValues = Object.values(updates)
    .filter((_, index) => !['code'].includes(Object.keys(updates)[index]))

  const stmt = db.prepare(`
    UPDATE t_project
    SET ${updateFields}, update_time = CURRENT_TIMESTAMP
    WHERE code = ?
  `)

  stmt.run([...updateValues, code])
  return getProjectByCode(code)
}

// 删除项目
export function deleteProject(code: string) {
  const stmt = db.prepare(`
    DELETE FROM t_project WHERE code = ?
  `)

  return stmt.run(code)
}

// 创建项目步骤
export function createProjectStep(step: Omit<ProjectStep, 'create_time' | 'update_time'>) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO t_project_step (
      project_code, step_number, step_name, status, data, raw_content,
      system_prompt, user_prompt, input, output, raw_response, timing
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  try {
    stmt.run([
      step.project_code,
      step.step_number,
      step.step_name,
      step.status,
      step.data || '',
      step.raw_content,
      step.system_prompt,
      step.user_prompt,
      step.input,
      step.output,
      step.raw_response,
      step.timing
    ])

    return getProjectStepByNumber(step.project_code, step.step_number)
  } catch (error) {
    console.error('创建项目步骤失败:', error)
    throw error
  }
}

// 获取项目步骤
export function getProjectStepByNumber(projectCode: string, stepNumber: number) {
  const stmt = db.prepare(`
    SELECT * FROM t_project_step WHERE project_code = ? AND step_number = ?
  `)

  return stmt.get(projectCode, stepNumber) as ProjectStep
}

// 获取项目的所有步骤
export function getProjectSteps(projectCode: string) {
  const stmt = db.prepare(`
    SELECT * FROM t_project_step WHERE project_code = ? ORDER BY step_number
  `)

  return stmt.all(projectCode) as ProjectStep[]
}

// 更新项目步骤
export function updateProjectStep(
  projectCode: string,
  stepNumber: number,
  updates: Partial<ProjectStep>
) {
  const updateFields = Object.keys(updates)
    .filter(key => !['project_code', 'step_number'].includes(key)) // 不允许更新主键字段
    .map(key => `${key} = ?`)
    .join(', ')

  const updateValues = Object.values(updates)
    .filter((_, index) => !['project_code', 'step_number'].includes(Object.keys(updates)[index]))

  const stmt = db.prepare(`
    UPDATE t_project_step
    SET ${updateFields}, update_time = CURRENT_TIMESTAMP
    WHERE project_code = ? AND step_number = ?
  `)

  stmt.run([...updateValues, projectCode, stepNumber])
  return getProjectStepByNumber(projectCode, stepNumber)
}

// 删除项目的所有步骤
export function deleteProjectSteps(projectCode: string) {
  const stmt = db.prepare(`
    DELETE FROM t_project_step WHERE project_code = ?
  `)

  return stmt.run(projectCode)
}

// 保存项目版本
export function createProjectVersion(
  projectCode: string,
  versionNumber: string,
  versionName: string,
  isPublished: boolean = false
) {
  // 获取项目当前状态
  const project = getProjectByCode(projectCode)
  if (!project) {
    throw new Error('项目不存在')
  }

  // 获取项目当前步骤
  const steps = getProjectSteps(projectCode)

  // 创建版本快照
  const version: Omit<ProjectVersion, 'id' | 'create_time' | 'publish_time'> = {
    project_code: projectCode,
    version_number: versionNumber,
    version_name: versionName,
    is_published: isPublished ? 1 : 0,
    project_snapshot: JSON.stringify(project),
    steps_snapshot: JSON.stringify(steps)
  }

  const stmt = db.prepare(`
    INSERT INTO t_project_version (
      project_code, version_number, version_name, is_published,
      project_snapshot, steps_snapshot, publish_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  try {
    stmt.run([
      version.project_code,
      version.version_number,
      version.version_name,
      version.is_published,
      version.project_snapshot,
      version.steps_snapshot,
      isPublished ? new Date().toISOString() : null
    ])

    // 查询刚刚创建的版本
    const queryStmt = db.prepare(`
      SELECT * FROM t_project_version
      WHERE project_code = ? AND version_number = ?
    `)

    return queryStmt.get(version.project_code, version.version_number) as ProjectVersion
  } catch (error) {
    console.error('保存版本失败:', error)
    throw error
  }
}

// 获取项目版本
export function getProjectVersionById(id: number) {
  const stmt = db.prepare(`
    SELECT * FROM t_project_version WHERE id = ?
  `)

  return stmt.get(id) as ProjectVersion
}

// 获取项目的所有版本
export function getProjectVersions(projectCode: string) {
  const stmt = db.prepare(`
    SELECT * FROM t_project_version WHERE project_code = ? ORDER BY id DESC
  `)

  return stmt.all(projectCode) as ProjectVersion[]
}

// 发布版本
export function publishProjectVersion(id: number) {
  const stmt = db.prepare(`
    UPDATE t_project_version
    SET is_published = 1, publish_time = CURRENT_TIMESTAMP
    WHERE id = ?
  `)

  stmt.run(id)

  return getProjectVersionById(id)
}

// 创建项目日志
export function createProjectLog(log: Omit<ProjectLog, 'create_time'>) {
  const stmt = db.prepare(`
    INSERT INTO t_project_log (
      project_code, level, title, content
    ) VALUES (?, ?, ?, ?)
  `)

  stmt.run([
    log.project_code,
    log.level,
    log.title,
    log.content
  ])

  return getProjectLogByTitle(log.project_code, log.title)
}

// 获取项目日志
export function getProjectLogByTitle(projectCode: string, title: string) {
  const stmt = db.prepare(`
    SELECT * FROM t_project_log WHERE project_code = ? AND title = ?
  `)

  return stmt.get(projectCode, title) as ProjectLog
}

// 获取项目的所有日志
export function getProjectLogs(projectCode: string) {
  const stmt = db.prepare(`
    SELECT * FROM t_project_log WHERE project_code = ? ORDER BY create_time
  `)

  return stmt.all(projectCode) as ProjectLog[]
}

// 清空项目的所有日志
export function clearProjectLogs(projectCode: string) {
  const stmt = db.prepare(`
    DELETE FROM t_project_log WHERE project_code = ?
  `)

  return stmt.run(projectCode)
}
