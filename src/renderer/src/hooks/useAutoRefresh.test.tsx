import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'
import { useAutoRefresh } from './useAutoRefresh'
import { RefreshProvider } from '../contexts/RefreshContext'

describe('useAutoRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call onRefresh when enabled', () => {
    const onRefresh = vi.fn()
    const wrapper = ({ children }) => <RefreshProvider>{children}</RefreshProvider>
    renderHook(() => useAutoRefresh(onRefresh, 'some-jql'), { wrapper })

    vi.advanceTimersByTime(60 * 1000)
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('should not call onRefresh when disabled', () => {
    const onRefresh = vi.fn()
    const wrapper = ({ children }) => <RefreshProvider>{children}</RefreshProvider>
    renderHook(() => useAutoRefresh(onRefresh, null), { wrapper })

    vi.advanceTimersByTime(60 * 1000)
    expect(onRefresh).not.toHaveBeenCalled()
  })
})