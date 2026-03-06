'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      running: { bg: 'bg-blue-100', text: 'text-blue-600', label: '运行中' },
      completed: { bg: 'bg-green-100', text: 'text-green-600', label: '已完成' },
      failed: { bg: 'bg-red-100', text: 'text-red-600', label: '失败' }
    }
    return badges[status] || badges.pending
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🚀</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">zeroai</h1>
          </div>
          <button
            onClick={() => setShowNewProject(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>+</span>
            新建项目
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        {projects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🎮</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              欢迎使用 zeroai！
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
              一个通用的 AI 开发助手，能够按照五步流程开发任意软件应用。
              从需求理解到代码生成，让 AI 帮你开发软件！
            </p>
            <button
              onClick={() => setShowNewProject(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium text-lg transition-colors inline-flex items-center gap-2"
            >
              <span>🚀</span>
              开始你的第一个项目
            </button>
          </div>
        )}

        {/* Project Grid */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">我的项目</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const statusBadge = getStatusBadge(project.status)
                const params = new URLSearchParams()
                params.set('name', project.name)
                params.set('req', project.requirements)
                return (
                  <div key={project.code} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
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
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                        {project.requirements}
                      </p>
                      <Link
                        href={'/projects/' + project.code + '?' + params.toString()}
                        className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors"
                      >
                        打开项目
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">新建项目</h2>
                <button
                  onClick={() => setShowNewProject(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Project Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    项目需求（自然语言描述）
                  </label>
                  <textarea
                    required
                    rows={10}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    尽可能详细地描述你的需求，包括功能特性、技术要求等。
                  </p>
                </div>

                {/* Tech Stack (Optional) - Simplified */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    技术栈（可选）
                  </label>
                  <div className="text-gray-500 text-sm">
                    默认使用：Next.js + TypeScript + Tailwind CSS
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewProject(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🚀</span>
                    开始创建
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
