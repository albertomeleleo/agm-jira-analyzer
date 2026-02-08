import React from 'react'
import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'
import { useInterval } from './useInterval'

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call the callback function repeatedly after the specified delay', () => {
    const callback = vi.fn()
    renderHook(() => useInterval(callback, 1000))

    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should not call the callback if the delay is null', () => {
    const callback = vi.fn()
    renderHook(() => useInterval(callback, null))

    vi.advanceTimersByTime(2000)
    expect(callback).not.toHaveBeenCalled()
  })

  it('should clear the interval on unmount', () => {
    const callback = vi.fn()
    const { unmount } = renderHook(() => useInterval(callback, 1000))

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)

    unmount()
    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)
  })
})
