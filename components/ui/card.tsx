'use client'

import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
  highlight?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  highlight = false,
}) => {
  const baseClasses = 'bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300'
  const hoverClasses = hoverable
    ? 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer'
    : ''
  const highlightClasses = highlight
    ? 'border-2 border-indigo-500 ring-4 ring-indigo-100'
    : ''

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${highlightClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export const CardHeader: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>
}

export const CardBody: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => {
  return <div className={`px-6 pb-6 ${className}`}>{children}</div>
}

export const CardFooter: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => {
  return <div className={`px-6 pb-6 flex items-center gap-3 ${className}`}>{children}</div>
}
