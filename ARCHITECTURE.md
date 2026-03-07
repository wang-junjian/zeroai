# 技术架构文档

本文档详细描述 ZeroAI 项目的技术架构、核心模块设计和工作原理。

## 目录

- [系统概述](#系统概述)
- [技术栈](#技术栈)
- [目录结构](#目录结构)
- [核心模块](#核心模块)
- [数据库设计](#数据库设计)
- [API 设计](#api-设计)
- [工作流程](#工作流程)

## 系统概述

ZeroAI 是一个 AI 驱动的软件开发助手，采用五步开发流程自动化软件开发生命周期。系统通过与 AI 模型交互，逐步完成需求分析、设计和代码生成。

### 核心特性

- **五步开发工作流**：需求理解 → 接口设计 → 数据库设计 → 业务逻辑 → 代码生成
- **版本管理系统**：完整的项目版本快照和恢复功能
- **交互式审查**：每步结果可查看、审批或重新生成
- **文档导出**：支持导出完整的 Word 项目文档
- **持久化存储**：SQLite 数据库存储所有项目数据

## 技术栈

| 层次 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 16 (App Router) | React 元框架 |
| 语言 | TypeScript 5 | 类型安全 |
| UI 样式 | Tailwind CSS 4 | 实用优先的 CSS 框架 |
| 后端 API | Next.js Route Handlers | App Router API 路由 |
| 数据库 | Better-SQLite3 | 轻量级嵌入式数据库 |
| AI 集成 | OpenAI SDK | 兼容 OpenAI 格式的 API |
| 文档导出 | docx | Word 文档生成库 |
| Markdown | react-markdown + remark-gfm | Markdown 渲染 |

## 目录结构

```
zeroai/
├── app/                                      # Next.js App Router
│   ├── api/                                  # API 路由
│   │   ├── analyze/                          # 需求分析 API
│   │   │   └── route.ts
│   │   ├── design/                           # 设计相关 API
│   │   │   ├── interfaces/
│   │   │   ├── database/
│   │   │   └── business-logic/
│   │   ├── generate/                         # 代码生成 API
│   │   │   └── route.ts
│   │   └── projects/                         # 项目管理 API
│   │       └── [code]/
│   │           ├── route.ts                  # 项目 CRUD
│   │           └── versions/
│   │               └── route.ts              # 版本管理
│   ├── projects/
│   │   └── [code]/                           # 项目详情页
│   │       ├── components/                   # 项目详情组件
│   │       │   ├── Sidebar.tsx               # 步骤侧边栏
│   │       │   ├── StepContent.tsx           # 步骤内容展示
│   │       │   ├── LogDisplay.tsx            # 日志展示
│   │       │   ├── VersionManager.tsx        # 版本管理
│   │       │   └── ExportToWord.tsx          # Word 导出
│   │       ├── hooks/                         # 自定义 Hooks
│   │       │   ├── useProjectDetail.ts       # 项目详情状态管理
│   │       │   └── useLogs.ts                # 日志状态管理
│   │       ├── types.ts                       # 类型定义（导出统一类型）
│   │       ├── constants.ts                   # 常量定义（导出统一常量）
│   │       ├── utils.ts                       # 工具函数
│   │       └── page.tsx                       # 项目详情主页面
│   ├── globals.css                            # 全局样式
│   ├── layout.tsx                             # 根布局
│   └── page.tsx                               # 首页（项目列表）
├── components/                                 # 通用组件
│   ├── features/                              # 功能组件
│   │   ├── step-indicator.tsx                # 步骤指示器
│   │   └── info-panel.tsx                     # 信息面板
│   └── ui/                                    # UI 基础组件
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── lib/                                        # 核心库
│   ├── ai-service.ts                          # AI 服务封装
│   ├── database.ts                            # 数据库初始化
│   ├── project-db.ts                          # 项目数据库操作
│   └── api-utils.ts                          # API 响应处理工具
├── types/                                     # 项目级类型定义
│   └── index.ts                              # 统一类型管理
├── constants/                                 # 项目级常量定义
│   └── project.ts                            # 统一常量管理
├── prompts/                                    # AI 提示词
│   ├── analyze-requirements.md                # 需求分析提示词
│   ├── design-interfaces.md                   # 接口设计提示词
│   ├── design-database.md                     # 数据库设计提示词
│   ├── design-business-logic.md               # 业务逻辑设计提示词
│   └── generate-code.md                       # 代码生成提示词
├── public/                                     # 静态资源
├── .env.example                                # 环境变量模板
├── tailwind.config.ts                          # Tailwind 配置
├── tsconfig.json                               # TypeScript 配置
└── zeroai.db                                   # SQLite 数据库文件（自动生成）
```

## 核心模块

### 1. AI 服务模块 (`lib/ai-service.ts`)

封装与 AI 模型的交互，提供标准化的接口。

#### 主要功能

- 读取提示词文件
- 调用 AI API 生成响应
- 五步开发流程的专用方法

#### 关键函数

| 函数 | 说明 |
|------|------|
| `generateResponse()` | 通用 AI 响应生成 |
| `analyzeRequirements()` | 需求理解分析 |
| `designInterfaces()` | 接口设计 |
| `designDatabase()` | 数据库设计 |
| `designBusinessLogic()` | 业务逻辑设计 |
| `generateCode()` | 代码生成 |

### 2. 类型管理模块 (`types/index.ts`)

统一管理项目的类型定义，提供完整的类型系统支持。

#### 核心类型

```typescript
// 项目
interface Project {
  code: string           // 项目唯一编码
  name: string           // 项目名称
  requirements: string   // 需求描述
  current_step: number   // 当前步骤
  status: string         // 状态
}

// 项目步骤
interface ProjectStep {
  project_code: string   // 所属项目
  step_number: number    // 步骤编号 1-5
  step_name: string      // 步骤名称
  status: string         // 状态: pending/generating/reviewing/approved/failed
  data: string           // 主要数据（Markdown）
  raw_content: string    // 原始内容
  system_prompt: string  // 系统提示词
  user_prompt: string    // 用户提示词
  input: string          // 输入内容
  output: string         // 输出内容
  raw_response: string   // 原始响应 JSON
  timing: string         // 计时信息 JSON
}

// 项目版本
interface ProjectVersion {
  project_code: string        // 所属项目
  version_number: string      // 版本号
  version_name: string        // 版本名称
  project_snapshot: string    // 项目快照 JSON
  steps_snapshot: string      // 步骤快照 JSON
}

// 项目日志
interface ProjectLog {
  project_code: string   // 所属项目
  level: string          // 级别: info/warn/error
  title: string          // 标题
  content: string        // 内容
}

// API 响应格式
interface ApiResponse<T = any> {
  code: string
  msg: string
  data: T
}
```

### 3. 常量管理模块 (`constants/project.ts`)

统一管理项目的常量定义，包括：

- **步骤名称**：`STEP_NAMES` - 五个开发步骤的中文名称
- **系统提示词**：`SYSTEM_PROMPTS` - 各步骤的 AI 提示词
- **API 端点**：`API_ENDPOINTS` - 各步骤对应的 API 路由
- **备用内容**：`FALLBACK_CONTENTS` - 失败时的备用响应内容

提供访问函数：

```typescript
// 获取步骤对应的 API 端点
function getApiEndpoint(stepNumber: number): string

// 获取步骤名称
function getStepName(stepNumber: number): string

// 获取系统提示词
function getSystemPrompt(stepNumber: number): string

// 获取备用内容（支持替换变量）
function getFallbackContent(stepNumber: number, projectName?: string): string
```

### 4. API 响应处理模块 (`lib/api-utils.ts`)

提供通用的 API 响应处理工具，包括：

- **`successResponse(data, msg)`**：成功响应
- **`errorResponse(msg, code, status)`**：错误响应
- **`createApiHandler(handler)`**：API 路由处理器包装器，自动处理错误
- **`validateRequest(req, requiredFields)`**：请求参数验证

### 5. 数据库模块

#### `lib/database.ts`

初始化数据库连接和表结构。包含两类表：
- 项目管理相关表（ZeroAI 自身使用）
- 坦克游戏相关表（示例项目遗留）

#### `lib/project-db.ts`

项目数据的 CRUD 操作封装。

#### 核心类型

```typescript
// 项目
interface Project {
  code: string           // 项目唯一编码
  name: string           // 项目名称
  requirements: string   // 需求描述
  current_step: number   // 当前步骤
  status: string         // 状态
}

// 项目步骤
interface ProjectStep {
  project_code: string   // 所属项目
  step_number: number    // 步骤编号 1-5
  step_name: string      // 步骤名称
  status: string         // 状态: pending/generating/reviewing/approved/failed
  data: string           // 主要数据（Markdown）
  raw_content: string    // 原始内容
  system_prompt: string  // 系统提示词
  user_prompt: string    // 用户提示词
  input: string          // 输入内容
  output: string         // 输出内容
  raw_response: string   // 原始响应 JSON
  timing: string         // 计时信息 JSON
}

// 项目版本
interface ProjectVersion {
  project_code: string        // 所属项目
  version_number: string      // 版本号
  version_name: string        // 版本名称
  project_snapshot: string    // 项目快照 JSON
  steps_snapshot: string      // 步骤快照 JSON
}

// 项目日志
interface ProjectLog {
  project_code: string   // 所属项目
  level: string          // 级别: info/warn/error
  title: string          // 标题
  content: string        // 内容
}
```

### 6. 项目详情 Hook (`app/projects/[code]/hooks/useProjectDetail.ts`)

项目详情页面的核心状态管理逻辑。

#### 状态管理

- `steps`: 五个步骤的状态数组
- `projectName`: 项目名称
- `requirements`: 项目需求
- `currentStep`: 当前执行的步骤
- `isRunning`: 是否正在执行
- `versions`: 版本列表
- `selectedVersion`: 选中的版本
- `logs`: 日志列表

#### 核心方法

| 方法 | 说明 |
|------|------|
| `startStep(stepNum)` | 开始执行某一步骤 |
| `regenerateStep(stepNum)` | 重新生成某一步 |
| `approveStep(stepNum)` | 审批通过某一步 |
| `goToNextStep(stepNum)` | 进入下一步 |
| `createVersion()` | 创建版本 |
| `createNewVersion()` | 创建新版本（重置） |
| `loadVersion()` | 加载历史版本 |

#### 自动保存

使用防抖机制，数据变更后延迟 1 秒自动保存到数据库。

### 7. Word 导出组件 (`app/projects/[code]/components/ExportToWord.tsx`)

将项目内容导出为 Word 文档。

#### 支持的 Markdown 格式

- 标题（H1-H5）
- 粗体和斜体
- 有序和无序列表
- 引用块
- 代码块（灰色背景）
- 分隔线

### 8. API 路由

所有 API 路由都使用统一的响应格式和错误处理机制，通过 `lib/api-utils.ts` 中提供的工具函数实现。

#### 需求分析 (`api/analyze/route.ts`)
```typescript
import { NextRequest } from 'next/server'
import { analyzeRequirements } from '@/lib/ai-service'
import { createApiHandler, validateRequest } from '@/lib/api-utils'

interface AnalyzeRequest {
  description: string
}

export const POST = createApiHandler(async (req: NextRequest) => {
  const { description } = await validateRequest<AnalyzeRequest>(req, ['description'])
  return await analyzeRequirements(description)
})
```
**请求**:
```typescript
POST /api/analyze
Body: { description: string }
```
**响应**:
```typescript
{
  code: string;    // "000000" 表示成功
  msg: string;     // 响应消息
  data: string;    // Markdown 格式的需求分析结果
}
```

#### 接口设计 (`api/design/interfaces/route.ts`)
```typescript
import { NextRequest } from 'next/server'
import { designInterfaces } from '@/lib/ai-service'
import { createApiHandler, validateRequest } from '@/lib/api-utils'

interface DesignInterfacesRequest {
  requirements: string
}

export const POST = createApiHandler(async (req: NextRequest) => {
  const { requirements } = await validateRequest<DesignInterfacesRequest>(req, ['requirements'])
  return await designInterfaces(requirements)
})
```
**请求**:
```typescript
POST /api/design/interfaces
Body: { requirements: string }
```

#### 数据库设计 (`api/design/database/route.ts`)
```typescript
import { NextRequest } from 'next/server'
import { designDatabase } from '@/lib/ai-service'
import { createApiHandler, validateRequest } from '@/lib/api-utils'

interface DesignDatabaseRequest {
  requirements: string
}

export const POST = createApiHandler(async (req: NextRequest) => {
  const { requirements } = await validateRequest<DesignDatabaseRequest>(req, ['requirements'])
  return await designDatabase(requirements)
})
```
**请求**:
```typescript
POST /api/design/database
Body: { requirements: string }
```

#### 业务逻辑设计 (`api/design/business-logic/route.ts`)
```typescript
import { NextRequest } from 'next/server'
import { designBusinessLogic } from '@/lib/ai-service'
import { createApiHandler, validateRequest } from '@/lib/api-utils'

interface DesignBusinessLogicRequest {
  interfaces: string
}

export const POST = createApiHandler(async (req: NextRequest) => {
  const { interfaces } = await validateRequest<DesignBusinessLogicRequest>(req, ['interfaces'])
  return await designBusinessLogic(interfaces)
})
```
**请求**:
```typescript
POST /api/design/business-logic
Body: { interfaces: string }
```

#### 代码生成 (`api/generate/route.ts`)
```typescript
import { NextRequest } from 'next/server'
import { generateCode } from '@/lib/ai-service'
import { createApiHandler, validateRequest } from '@/lib/api-utils'

interface GenerateCodeRequest {
  requirements: string
  interfaces: string
  businessLogic: string
}

export const POST = createApiHandler(async (req: NextRequest) => {
  const { requirements, interfaces, businessLogic } = await validateRequest<GenerateCodeRequest>(
    req,
    ['requirements', 'interfaces', 'businessLogic']
  )
  return await generateCode(requirements, interfaces, businessLogic)
})
```
**请求**:
```typescript
POST /api/generate
Body: {
  requirements: string,
  interfaces: string,
  businessLogic: string
}
```

#### 项目管理 (`api/projects/[code]/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getProjectByCode, updateProject } from '@/lib/project-db'

// GET 方法 - 获取项目详情
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const project = getProjectByCode(params.code)
  if (!project) {
    return NextResponse.json(
      { code: '000003', msg: '项目未找到', data: null },
      { status: 404 }
    )
  }
  return NextResponse.json({
    code: '000000',
    msg: '查询成功',
    data: project
  })
}

// PUT 方法 - 更新项目
export async function PUT(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const { project, steps } = await req.json()
  try {
    const updatedProject = updateProject(params.code, project)
    return NextResponse.json({
      code: '000000',
      msg: '更新成功',
      data: updatedProject
    })
  } catch (error) {
    return NextResponse.json(
      { code: '000001', msg: '更新失败', data: null },
      { status: 500 }
    )
  }
}
```

#### 版本管理 (`api/projects/[code]/versions/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getProjectByCode, createProjectVersion } from '@/lib/project-db'

// POST 方法 - 创建项目版本
export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const { versionNumber, versionName } = await req.json()

  const project = getProjectByCode(params.code)
  if (!project) {
    return NextResponse.json(
      { code: '000003', msg: '项目未找到', data: null },
      { status: 404 }
    )
  }

  try {
    const version = createProjectVersion(
      params.code,
      versionNumber,
      versionName
    )

    return NextResponse.json({
      code: '000000',
      msg: '创建版本成功',
      data: version
    })
  } catch (error) {
    return NextResponse.json(
      { code: '000001', msg: '创建版本失败', data: null },
      { status: 500 }
    )
  }
}
```
## 数据库设计

### 项目相关表

#### `t_project` - 项目表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| code | TEXT | 项目唯一编码 |
| name | TEXT | 项目名称 |
| requirements | TEXT | 需求描述 |
| current_step | INTEGER | 当前步骤 |
| status | TEXT | 状态 |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

#### `t_project_step` - 项目步骤表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| project_code | TEXT | 项目编码 |
| step_number | INTEGER | 步骤号 1-5 |
| step_name | TEXT | 步骤名称 |
| status | TEXT | 状态 |
| data | TEXT | 主要数据 |
| raw_content | TEXT | 原始内容 |
| system_prompt | TEXT | 系统提示词 |
| user_prompt | TEXT | 用户提示词 |
| input | TEXT | 输入 |
| output | TEXT | 输出 |
| raw_response | TEXT | 原始响应 JSON |
| timing | TEXT | 计时信息 JSON |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

#### `t_project_version` - 项目版本表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| project_code | TEXT | 项目编码 |
| version_number | TEXT | 版本号 |
| version_name | TEXT | 版本名称 |
| is_published | INTEGER | 是否已发布 |
| project_snapshot | TEXT | 项目快照 JSON |
| steps_snapshot | TEXT | 步骤快照 JSON |
| create_time | DATETIME | 创建时间 |
| publish_time | DATETIME | 发布时间 |

#### `t_project_log` - 项目日志表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| project_code | TEXT | 项目编码 |
| level | TEXT | 日志级别 |
| title | TEXT | 日志标题 |
| content | TEXT | 日志内容 |
| create_time | DATETIME | 创建时间 |

## API 设计

### 响应格式

所有 API 响应统一使用以下格式：

```typescript
{
  code: string;      // 响应码，"000000" 表示成功
  msg: string;       // 响应消息
  data?: any;        // 响应数据
}
```

### 五步工作流 API

#### 步骤 1: 需求理解
```typescript
POST /api/analyze
{
  description: string  // 用户需求描述
}
```

#### 步骤 2: 接口设计
```typescript
POST /api/design/interfaces
{
  requirements: string  // 需求分析结果
}
```

#### 步骤 3: 数据库设计
```typescript
POST /api/design/database
{
  requirements: string  // 需求分析结果
}
```

#### 步骤 4: 业务逻辑设计
```typescript
POST /api/design/business-logic
{
  interfaces: string  // 接口设计结果
}
```

#### 步骤 5: 代码生成
```typescript
POST /api/generate
{
  requirements: string,    // 需求分析结果
  interfaces: string,      // 接口设计结果
  businessLogic: string    // 业务逻辑设计结果
}
```

## 工作流程

### 完整开发流程

```
1. 用户创建项目
   ├─ 输入项目名称和需求
   └─ 生成项目编码 (proj-{timestamp})

2. 步骤 1: 需求理解
   ├─ 发送需求到 /api/analyze
   ├─ AI 分析并输出需求文档
   ├─ 用户审查 → 审批通过 或 重新生成
   └─ 保存到 t_project_step (step=1)

3. 步骤 2: 接口设计
   ├─ 发送步骤1结果到 /api/design/interfaces
   ├─ AI 设计 API 接口
   ├─ 用户审查 → 审批通过 或 重新生成
   └─ 保存到 t_project_step (step=2)

4. 步骤 3: 数据库设计
   ├─ 发送步骤1结果到 /api/design/database
   ├─ AI 设计数据库结构
   ├─ 用户审查 → 审批通过 或 重新生成
   └─ 保存到 t_project_step (step=3)

5. 步骤 4: 业务逻辑设计
   ├─ 发送步骤2结果到 /api/design/business-logic
   ├─ AI 设计业务处理逻辑
   ├─ 用户审查 → 审批通过 或 重新生成
   └─ 保存到 t_project_step (step=4)

6. 步骤 5: 代码生成
   ├─ 发送步骤1/2/4结果到 /api/generate
   ├─ AI 生成完整源代码
   ├─ 用户审查 → 审批通过 或 重新生成
   └─ 保存到 t_project_step (step=5)

7. 完成
   ├─ 项目状态标记为完成
   ├─ 可创建版本快照
   └─ 可导出 Word 文档
```

### 版本管理流程

```
创建版本
  ├─ 序列化当前 project 和 steps
  ├─ 保存到 t_project_version
  └─ 版本号相同时覆盖

加载版本
  ├─ 从 t_project_version 读取
  ├─ 解析 project_snapshot 和 steps_snapshot
  └─ 恢复到前端状态
```

### 数据流

```
用户输入
  ↓
useProjectDetail (状态管理)
  ↓
API Route (Route Handler)
  ↓
ai-service.ts (AI 调用)
  ↓
OpenAI API
  ↓
返回结果
  ↓
更新状态 (自动保存到 DB)
  ↓
UI 渲染
```

## 提示词管理

提示词文件存放在 `prompts/` 目录下，每个步骤一个文件：

- `analyze-requirements.md` - 需求分析提示词
- `design-interfaces.md` - 接口设计提示词
- `design-database.md` - 数据库设计提示词
- `design-business-logic.md` - 业务逻辑设计提示词
- `generate-code.md` - 代码生成提示词

提示词可以根据需要进行定制，以适应不同的开发场景。

## 扩展开发

### 添加新的开发步骤

1. 在 `app/projects/[code]/constants.ts` 添加步骤名称和 API 端点
2. 在 `prompts/` 添加对应的提示词文件
3. 在 `lib/ai-service.ts` 添加 AI 调用方法
4. 创建新的 API Route
5. 更新 `useProjectDetail.ts` 中的步骤逻辑

### 自定义 AI 模型

修改 `.env` 文件：

```env
OPENAI_BASE_URL=https://your-custom-api.com/v1
OPENAI_API_KEY=your-key
OPENAI_MODEL=your-model-name
```

### 导出格式扩展

修改 `ExportToWord.tsx` 组件，添加新的导出格式支持（如 PDF、Markdown 等）。
