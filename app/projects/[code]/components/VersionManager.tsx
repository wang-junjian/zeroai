'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'

interface VersionManagerProps {
  versions: any[]
  onCreateVersion: (versionNumber: string, versionName: string) => Promise<void>
  onLoadVersion: (version: any) => Promise<void>
  selectedVersion?: any
}

export const VersionManager: React.FC<VersionManagerProps> = ({
  versions,
  onCreateVersion,
  onLoadVersion,
  selectedVersion
}) => {
  const [versionNumber, setVersionNumber] = useState('1.0.0')
  const [versionName, setVersionName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateVersion = async () => {
    if (!versionNumber) return
    setIsCreating(true)
    try {
      await onCreateVersion(versionNumber, versionName)
      setVersionName('')
    } catch (error) {
      console.error('保存版本失败:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleLoadVersion = async (version: any) => {
    try {
      await onLoadVersion(version)
    } catch (error) {
      console.error('加载版本失败:', error)
    }
  }

  return (
    <Card className="flex-shrink-0">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-bold text-gray-900">版本管理</h3>
      </CardHeader>
      <CardBody>
        {/* 创建版本 */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            value={versionNumber}
            onChange={(e) => setVersionNumber(e.target.value)}
            placeholder="版本号 (e.g., 1.0.0)"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            placeholder="版本名称 (可选)"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button
            onClick={handleCreateVersion}
            disabled={isCreating || !versionNumber}
            size="sm"
          >
            {isCreating ? '保存中...' : '保存版本'}
          </Button>
        </div>

        {/* 版本列表 */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {versions.length === 0 ? (
            <div className="text-gray-500 text-sm py-4 text-center">
              暂无版本
            </div>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  selectedVersion?.id === version.id
                    ? 'bg-indigo-100 border border-indigo-300'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-gray-900">
                    {version.version_number}
                    {version.version_name && (
                      <span className="text-gray-500 ml-2">
                        - {version.version_name}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(version.create_time).toLocaleString()}
                  </span>
                </div>
                <Button
                  onClick={() => handleLoadVersion(version)}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                >
                  加载
                </Button>
              </div>
            ))
          )}
        </div>
      </CardBody>
    </Card>
  )
}
