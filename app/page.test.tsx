import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock next/navigation used by the page
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

import Home from './page'

describe('Home.page', () => {
  let fetchMock: any

  beforeEach(() => {
    // 清空 localStorage
    localStorage.clear()

    // mock fetch
    fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, json: async () => ({}) })
    )
    // @ts-ignore
    global.fetch = fetchMock
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should create a project with API call', async () => {
    // Render the page
    render(<Home />)

    // Open the modal
    fireEvent.click(screen.getByText('新建项目'))

    // Fill out form
    fireEvent.input(screen.getByPlaceholderText(/例如：坦克大战游戏/i), {
      target: { value: '测试项目' }
    })

    fireEvent.input(screen.getByPlaceholderText(/详细描述你想要开发的软件.../i), {
      target: { value: '这是一个详细的项目需求描述，用于测试HTTP 431错误修复' }
    })

    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByText('开始创建'))
      await Promise.resolve()
    })

    // Verify that fetch was called with correct URL and body
    expect(fetchMock).toHaveBeenCalled()
    const fetchCalls = fetchMock.mock.calls

    // 应该有 PUT 请求
    const putCall = fetchCalls.find((call: any) =>
      call[1] && call[1].method === 'PUT'
    )

    expect(putCall).toBeDefined()

    // 验证请求体是否包含正确的数据
    const requestBody = JSON.parse(putCall[1].body)
    expect(requestBody.project.name).toBe('测试项目')
    expect(requestBody.project.requirements).toBe('这是一个详细的项目需求描述，用于测试HTTP 431错误修复')
    expect(requestBody.project.status).toBe('active')
  })

  it('should save project to localStorage after creation', async () => {
    // Render the page
    render(<Home />)

    // Open the modal
    fireEvent.click(screen.getByText('新建项目'))

    // Fill out form
    fireEvent.input(screen.getByPlaceholderText(/例如：坦克大战游戏/i), {
      target: { value: '测试项目' }
    })

    fireEvent.input(screen.getByPlaceholderText(/详细描述你想要开发的软件.../i), {
      target: { value: '项目需求' }
    })

    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByText('开始创建'))
      await Promise.resolve()
    })

    // Verify localStorage was updated
    const savedProjects = JSON.parse(localStorage.getItem('zeroai-projects') || '[]')
    expect(savedProjects.length).toBe(1)
    expect(savedProjects[0].name).toBe('测试项目')
    expect(savedProjects[0].requirements).toBe('项目需求')
  })
})
