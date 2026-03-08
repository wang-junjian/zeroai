import React from 'react'
import { render, fireEvent, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { InfoPanel } from './info-panel'

describe('InfoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debounces raw response edits and calls onChangeDetail with parsed JSON', async () => {
    const onChange = vi.fn()
    const stepDetail = {
      stepNumber: 1,
      stepName: '需求理解',
      systemPrompt: 'sys',
      userPrompt: '',
      input: '',
      output: '',
      rawResponse: { a: 1 }
    }

    render(<InfoPanel stepDetail={stepDetail as any} defaultActiveTab="response" onChangeDetail={onChange} />)

    const textarea = screen.getByRole('textbox')
    await act(async () => {
      fireEvent.change(textarea, { target: { value: JSON.stringify({ b: 2 }, null, 2) } })
      // wait for debounce duration
      await new Promise((r) => setTimeout(r, 900))
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({ rawResponse: { b: 2 } })
  })

  it('debounces input edits and calls onChangeDetail with input and userPrompt', async () => {
    const onChange = vi.fn()
    const stepDetail = {
      stepNumber: 2,
      stepName: '接口设计',
      systemPrompt: 'sys',
      userPrompt: '',
      input: 'initial',
      output: ''
    }

    render(<InfoPanel stepDetail={stepDetail as any} defaultActiveTab="input" onChangeDetail={onChange} />)

    // 切换到原始格式以显示 textarea
    const rawBtn = screen.getByText('原始格式')
    await act(async () => rawBtn.click())

    const textarea = screen.getByRole('textbox')
    await act(async () => {
      fireEvent.change(textarea, { target: { value: '更新的输入内容' } })
      await new Promise((r) => setTimeout(r, 900))
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({ input: '更新的输入内容', userPrompt: '更新的输入内容' })
  })
})
