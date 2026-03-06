'use client'

import React from 'react'

interface ViewToggleProps {
  viewMode: 'simple' | 'detail'
  onViewModeChange: (mode: 'simple' | 'detail') => void
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onViewModeChange('simple')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
          viewMode === 'simple'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        简洁视图
      </button>
      <button
        onClick={() => onViewModeChange('detail')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
          viewMode === 'detail'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        详细视图
      </button>
    </div>
  )
}
