import { renderHook, act } from '@testing-library/react'
import { RefreshProvider, useRefresh } from './RefreshContext'

describe('RefreshContext', () => {
  it('should provide the autoRefreshInterval and a function to update it', async () => {
    const wrapper = ({ children }) => <RefreshProvider>{children}</RefreshProvider>
    const { result } = renderHook(() => useRefresh(), { wrapper })

    await act(() => Promise.resolve())

    expect(result.current.autoRefreshInterval).toBe(1)

    act(() => {
      result.current.setAutoRefreshInterval(15)
    })

    expect(result.current.autoRefreshInterval).toBe(15)
  })
})