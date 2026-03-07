import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ZeroAI - AI 开发助手',
  description: '一个通用的 AI 开发助手，能够按照五步流程开发任意软件应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
