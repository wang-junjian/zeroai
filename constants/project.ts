// 项目相关常量定义

/**
 * 步骤名称
 */
export const STEP_NAMES = ['需求理解', '接口设计', '数据库设计', '处理逻辑设计', '代码生成'] as const

/**
 * 步骤类型
 */
export type StepType = 1 | 2 | 3 | 4 | 5

/**
 * 步骤对应的 API 端点
 */
export const API_ENDPOINTS = [
  '/api/analyze',
  '/api/design/interfaces',
  '/api/design/database',
  '/api/design/business-logic',
  '/api/generate/code',
] as const

/**
 * AI 系统提示词
 */
export const SYSTEM_PROMPTS = [
  '你是一个专业的软件工程师，负责分析用户需求。请根据用户提供的软件项目描述，进行详细的需求分析。\n\n请使用 Markdown 格式输出，包含以下内容：\n\n1. **项目概述**：包括项目名称、项目类型、项目简介\n2. **功能需求**：列出所有功能需求，每个需求包含：\n   - 需求编号（如 FR-001）\n   - 功能模块\n   - 详细功能描述\n   - 优先级（高/中/低）\n3. **非功能需求**：包括性能要求、安全要求、可用性要求等\n4. **技术约束**：推荐的技术栈、架构模式等\n\n请确保分析准确、全面，不遗漏任何重要需求。',
  '你是一个专业的软件架构师，负责设计软件系统的接口。请根据用户提供的需求分析结果，进行详细的接口设计。\n\n请使用 Markdown 格式输出，包含以下内容：\n\n1. **系统架构概览**：简要描述系统的整体架构、模块划分\n2. **服务模块**：列出所有服务模块，每个模块包含：\n   - 模块名称\n   - 模块描述\n   - 主要职责\n3. **API 接口设计**：详细列出每个 API 接口，包含：\n   - 接口名称\n   - HTTP 方法（GET/POST/PUT/DELETE）\n   - 接口路径\n   - 功能描述\n   - 请求参数（参数名、类型、是否必需、说明）\n   - 响应数据结构\n   - 错误码说明\n\n请确保接口设计符合 RESTful 规范，遵循软件设计原则。',
  '你是一个专业的数据库设计师，负责设计软件系统的数据库结构。请根据用户提供的需求分析结果，进行详细的数据库设计。\n\n请使用 Markdown 格式输出，包含以下内容：\n\n1. **数据库概述**：简要描述数据库的用途、采用的存储引擎等\n2. **表结构设计**：列出所有数据表，每个表包含：\n   - 表名\n   - 中文描述\n   - 字段详细说明（字段名、类型、是否允许空值、默认值、说明）\n   - 主键、外键约束\n   - 索引设计\n3. **SQL 脚本**：提供完整的 CREATE TABLE 语句\n4. **关系图说明**：简要描述表之间的关系\n\n请确保数据库设计符合第三范式，避免数据冗余，保证数据一致性。',
  '你是一个专业的软件工程师，负责设计软件系统的处理逻辑。请根据用户提供的接口设计结果，进行详细的业务逻辑设计。\n\n请使用 Markdown 格式输出，包含以下内容：\n\n1. **业务流程概述**：简要描述系统的核心业务流程\n2. **接口处理逻辑**：为每个 API 接口设计详细的处理逻辑，包含：\n   - 接口名称\n   - 接口路径\n   - 前置条件\n   - 处理步骤（按顺序编号）\n   - 后置条件\n   - 返回结果\n   - 异常处理\n\n请确保处理逻辑清晰、具体、可实现。',
  '你是一个专业的软件工程师，负责根据需求分析结果、接口设计结果和处理逻辑设计结果生成软件源代码。\n\n请使用 Markdown 格式输出，包含以下内容：\n\n1. **项目结构**：展示完整的目录结构\n2. **技术选型说明**：说明为什么选择这些技术\n3. **核心代码文件**：提供关键文件的完整实现，包括：\n   - API 路由文件（route.ts）\n   - 数据库连接和模型\n   - 业务逻辑层\n   - 页面组件\n\n请使用 Next.js + TypeScript + Tailwind CSS 技术栈，代码应该是完整的、可运行的。',
] as const

/**
 * 步骤执行失败时的备用内容
 */
export const FALLBACK_CONTENTS: string[] = [
  `# 需求分析结果

## 项目概述
- 项目名称：{projectName}
- 项目类型：web_app
- 描述：一个基于用户需求的全栈应用

## 功能需求
1. FR-001 - 用户认证模块：用户注册、登录、登出功能
2. FR-002 - 数据管理模块：数据的增删改查操作
3. FR-003 - 用户界面模块：美观的响应式界面

## 非功能需求
1. NFR-001 - 性能：页面加载时间 < 2秒`,
  `# 接口设计结果

## 服务模块
1. 用户认证模块 - 处理用户注册和登录
2. 数据管理模块 - 处理数据 CRUD

## API 接口
1. POST /api/auth/register - 用户注册
2. POST /api/auth/login - 用户登录
3. GET /api/data - 获取数据列表
4. POST /api/data - 创建数据
5. PUT /api/data/:id - 更新数据
6. DELETE /api/data/:id - 删除数据`,
  `# 数据库设计结果

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
\`\`\``,
  `# 业务逻辑设计结果

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
- 删除：验证权限，删除记录`,
  `# 代码生成结果

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
\`\`\``,
]

/**
 * 获取步骤对应的 API 端点
 */
export function getApiEndpoint(stepNumber: number): string {
  if (stepNumber < 1 || stepNumber > API_ENDPOINTS.length) {
    throw new Error(`无效的步骤编号: ${stepNumber}`)
  }
  return API_ENDPOINTS[stepNumber - 1]
}

/**
 * 获取步骤名称
 */
export function getStepName(stepNumber: number): string {
  if (stepNumber < 1 || stepNumber > STEP_NAMES.length) {
    throw new Error(`无效的步骤编号: ${stepNumber}`)
  }
  return STEP_NAMES[stepNumber - 1]
}

/**
 * 获取系统提示词
 */
export function getSystemPrompt(stepNumber: number): string {
  if (stepNumber < 1 || stepNumber > SYSTEM_PROMPTS.length) {
    throw new Error(`无效的步骤编号: ${stepNumber}`)
  }
  return SYSTEM_PROMPTS[stepNumber - 1]
}

/**
 * 获取备用内容
 */
export function getFallbackContent(stepNumber: number, projectName?: string): string {
  if (stepNumber < 1 || stepNumber > FALLBACK_CONTENTS.length) {
    throw new Error(`无效的步骤编号: ${stepNumber}`)
  }
  let content = FALLBACK_CONTENTS[stepNumber - 1]
  if (projectName) {
    content = content.replace('{projectName}', projectName)
  }
  return content
}
