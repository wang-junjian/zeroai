import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock next/navigation used by the hook
vi.mock('next/navigation', () => ({
  useParams: () => ({ code: 'test' })
}))

// Mock useLogs hook used internally
vi.mock('./useLogs', () => ({
  useLogs: () => ({
    logs: [],
    logsExpanded: false,
    setLogsExpanded: () => {},
    addLog: vi.fn(),
    clearLogs: vi.fn()
  })
}))

import { useProjectDetail } from './useProjectDetail'

function TestComponent() {
  const { steps, updateStepDetail } = useProjectDetail()

  return (
    <div>
      <div data-testid="step1-output">{steps[0].detail?.output}</div>
      <button onClick={() => updateStepDetail(1, { output: 'new output' })}>update</button>
    </div>
  )
}

describe('useProjectDetail.updateStepDetail', () => {
  let fetchMock: any

  beforeEach(() => {
    // mock fetch to handle initial GET and subsequent PUT
    fetchMock = vi.fn((url: string, opts?: any) => {
      if (!opts || !opts.method) {
        // GET
        return Promise.resolve({ ok: true, json: async () => ({ project: { name: 'P', requirements: 'R', current_step: 1 }, steps: [], versions: [] }) })
      }
      if (opts.method === 'PUT') {
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) })
      }
      return Promise.resolve({ ok: true, json: async () => ({}) })
    })
    // @ts-ignore
    global.fetch = fetchMock
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('updates local step output and sends PUT to backend', async () => {
    await act(async () => {
      render(<TestComponent />)
    })

    const btn = screen.getByText('update')

    await act(async () => {
      btn.click()
      // allow microtasks
      await Promise.resolve()
    })

    const output = screen.getByTestId('step1-output')
    expect(output.textContent).toBe('new output')

    // 应该至少调用过一次 PUT（自动保存或 updateStepDetail 内触发）
    const putCalls = fetchMock.mock.calls.filter((c: any) => c[1] && c[1].method === 'PUT')
    expect(putCalls.length).toBeGreaterThanOrEqual(1)

    // 验证 PUT 请求体包含更新后的 output
    const lastPut = putCalls[putCalls.length - 1]
    const body = JSON.parse(lastPut[1].body)
    expect(body.steps.find((s: any) => s.step_number === 1).output).toBe('new output')
  })
})

describe('useProjectDetail.loadProjectData', () => {
  let fetchMock: any

  function TestComponent2() {
    const { steps, projectName, requirements } = useProjectDetail()
    return (
      <div>
        <div data-testid="project-name">{projectName}</div>
        <div data-testid="requirements">{requirements}</div>
        <div data-testid="step1-input">{steps[0].detail?.input}</div>
        <div data-testid="step1-userPrompt">{steps[0].detail?.userPrompt}</div>
      </div>
    )
  }

  it('initializes step1 with project requirements when no steps exist', async () => {
    fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          project: { name: '测试项目', requirements: '这是详细的项目需求', current_step: 0 },
          steps: [],
          versions: [],
          logs: []
        })
      })
    )
    // @ts-ignore
    global.fetch = fetchMock

    await act(async () => {
      render(<TestComponent2 />)
    })

    // 验证项目数据加载正确
    expect(screen.getByTestId('project-name').textContent).toBe('测试项目')
    expect(screen.getByTestId('requirements').textContent).toBe('这是详细的项目需求')

    // 验证步骤1的 input 和 userPrompt 正确设置
    expect(screen.getByTestId('step1-input').textContent).toBe('这是详细的项目需求')
    expect(screen.getByTestId('step1-userPrompt').textContent).toBe('这是详细的项目需求')
  })

  it('does not overwrite step1 input when steps exist', async () => {
    fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          project: { name: '测试项目', requirements: '项目需求', current_step: 1 },
          steps: [{
            step_number: 1,
            step_name: '需求理解',
            status: 'pending',
            data: '已有数据',
            input: '已存在的输入内容',
            user_prompt: '已存在的用户提示'
          }],
          versions: [],
          logs: []
        })
      })
    )
    // @ts-ignore
    global.fetch = fetchMock

    await act(async () => {
      render(<TestComponent2 />)
    })

    // 验证步骤1的 input 没有被项目需求覆盖
    expect(screen.getByTestId('step1-input').textContent).toBe('已存在的输入内容')
    expect(screen.getByTestId('step1-userPrompt').textContent).toBe('已存在的用户提示')
  })
})
