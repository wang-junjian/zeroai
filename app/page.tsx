'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'

interface Project {
  code: string
  name: string
  requirements: string
  createdAt: string
  status: 'pending' | 'running' | 'completed' | 'failed'
}

export default function Home() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [showNewProject, setShowNewProject] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [requirements, setRequirements] = useState('')

  // 从 localStorage 加载项目
  useEffect(() => {
    const savedProjects = localStorage.getItem('zeroai-projects')
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }, [])

  // 保存项目到 localStorage
  const saveProject = (project: Project) => {
    const newProjects = [project, ...projects]
    setProjects(newProjects)
    localStorage.setItem('zeroai-projects', JSON.stringify(newProjects))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectName || !requirements) {
      alert('请填写项目名称和需求！')
      return
    }
    // 创建项目
    const projectCode = 'proj-' + Date.now()
    const newProject: Project = {
      code: projectCode,
      name: projectName,
      requirements: requirements,
      createdAt: new Date().toISOString(),
      status: 'pending'
    }
    // 保存项目
    saveProject(newProject)
    // 关闭模态框
    setShowNewProject(false)
    setProjectName('')
    setRequirements('')
    // 跳转到项目详情页
    const params = new URLSearchParams()
    params.set('name', projectName)
    params.set('req', requirements)
    router.push('/projects/' + projectCode + '?' + params.toString())
  }

  const deleteProject = (projectCode: string) => {
    if (confirm('确定要删除这个项目吗？')) {
      const newProjects = projects.filter(p => p.code !== projectCode)
      setProjects(newProjects)
      localStorage.setItem('zeroai-projects', JSON.stringify(newProjects))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: Project['status']) => {
    const badges = {
      pending: { bg: 'bg-gray-100', text: 'text-gray-600', label: '待开始' },
      running: { bg: 'bg-gradient-to-r from-indigo-100 to-violet-100', text: 'text-indigo-700', label: '运行中' },
      completed: { bg: 'bg-gradient-to-r from-green-100 to-emerald-100', text: 'text-green-700', label: '已完成' },
      failed: { bg: 'bg-gradient-to-r from-red-100 to-rose-100', text: 'text-red-700', label: '失败' }
    }
    return badges[status] || badges.pending
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">🚀</span>
            </div>
            <h1 className="text-3xl font-bold text-gradient">ZeroAI</h1>
          </div>
          <Button
            onClick={() => setShowNewProject(true)}
            size="lg"
            className="shadow-lg hover:shadow-xl"
          >
            <span>+</span>
            新建项目
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        {projects.length === 0 && (
          <div className="text-center py-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              <span className="bg-purple-300 text-purple-700 px-2 py-1 rounded-md font-bold mr-2">需求即代码</span> 
              ZeroAI 让开发触手可及。
            </h2>
            {/* 流程图：请将图片文件放在 public/software-development-flow.png */}
            <div className="max-w-4xl mx-auto mb-8">
              <picture>
                <source srcSet="/software-development-flow.jpeg" type="image/jpeg" />
                <img
                  src="/software-development-flow.svg"
                  alt="软件开发流程图"
                  className="w-full h-auto rounded-lg shadow-lg border border-gray-100"
                />
              </picture>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {['需求理解', '接口设计', '数据库设计', '业务逻辑', '代码生成'].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <span className="text-xs font-medium px-3 py-1 bg-purple-50 text-purple-600 rounded-full border border-purple-100 shadow-sm">
                      {step}
                    </span>
                    {index < 4 && <span className="mx-2 text-gray-300">→</span>}
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={() => setShowNewProject(true)}
              size="lg"
              className="shadow-lg hover:shadow-xl"
            >
              <span>🚀</span>
              开始您的第一个项目
            </Button>
          </div>
        )}

        {/* Project Grid */}
        {projects.length > 0 && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">我的项目</h2>
              <div className="text-gray-600">
                共 {projects.length} 个项目
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const statusBadge = getStatusBadge(project.status)
                const params = new URLSearchParams()
                params.set('name', project.name)
                params.set('req', project.requirements)
                return (
                  <Card
                    key={project.code}
                    hoverable={true}
                    onClick={() => router.push('/projects/' + project.code + '?' + params.toString())}
                    className="group"
                  >
                    <CardBody className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                              {statusBadge.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(project.createdAt)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteProject(project.code)
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-6 leading-relaxed">
                        {project.requirements}
                      </p>
                      <div className="flex justify-between items-center">
                        <Button variant="outline" size="sm" className="w-full">
                          打开项目
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gradient">新建项目</h2>
                <button
                  onClick={() => setShowNewProject(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors p-2 rounded-lg hover:bg-gray-100"
                >
                  ×
                </button>
              </div>

              {/* New Project Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    项目名称
                  </label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="例如：坦克大战游戏"
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-lg"
                  />
                </div>

                {/* Project Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    项目需求（自然语言描述）
                  </label>
                  <textarea
                    required
                    rows={12}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="详细描述你想要开发的软件...
例如：
一个经典坦克游戏克隆，包含以下功能：
- 玩家坦克控制（WASD/方向键移动，空格键射击）
- AI 敌方坦克（自动移动和射击）
- 基地保护（保护金色基地不被摧毁）
- 关卡系统（通关后进入下一关）
- 地图元素：砖墙、钢墙、水域、树林、基地
- 道具系统：速度提升、火力提升、护盾、生命、炸弹、冻结"
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono text-sm"
                  />
                  <p className="mt-3 text-sm text-gray-500">
                    尽可能详细地描述你的需求，包括功能特性、技术要求等。
                  </p>
                </div>

                {/* Tech Stack (Optional) - Simplified */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    技术栈（可选）
                  </label>
                  <div className="text-gray-500 text-sm bg-gray-50 rounded-lg p-4">
                    默认使用：Next.js + TypeScript + Tailwind CSS
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    onClick={() => setShowNewProject(false)}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 shadow-lg hover:shadow-xl"
                  >
                    <span>🚀</span>
                    开始创建
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}