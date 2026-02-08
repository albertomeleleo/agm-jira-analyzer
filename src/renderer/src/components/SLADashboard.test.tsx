import { render, screen, fireEvent, act } from '@testing-library/react'
import { SLADashboard } from './SLADashboard'
import { vi } from 'vitest'
import { ThemeProvider } from '../contexts/ThemeContext'
import { ProjectProvider } from '../contexts/ProjectContext'
import { RefreshProvider } from '../contexts/RefreshContext'
import { FilterProvider } from '../contexts/FilterContext'

describe('SLADashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should auto-refresh after the specified interval', async () => {
    const wrapper = ({ children }) => (
      <ThemeProvider>
        <ProjectProvider>
          <FilterProvider>
            <RefreshProvider>{children}</RefreshProvider>
          </FilterProvider>
        </ProjectProvider>
      </ThemeProvider>
    )
    render(<SLADashboard />, { wrapper })

    await act(() => vi.advanceTimersByTimeAsync(60 * 1000))

    expect(screen.getByText(/Last sync:/)).toBeInTheDocument()
  })
})