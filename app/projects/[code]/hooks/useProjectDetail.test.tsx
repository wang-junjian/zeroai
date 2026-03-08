import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock next/navigation used by the hook
vi.mock('next/navigation', () => ({
  useParams: () => ({ code: 'test' }),
  useSearchParams: () => ({ get: (k: string) => null })
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
