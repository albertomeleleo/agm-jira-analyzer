import { render, screen, fireEvent, act } from '@testing-library/react'
import { SettingsPage } from './SettingsPage'
import { vi } from 'vitest'
import { ThemeProvider } from '../contexts/ThemeContext'
import { ProjectProvider } from '../contexts/ProjectContext'
import { RefreshProvider } from '../contexts/RefreshContext'

describe('SettingsPage', () => {
  it('should allow changing the auto-refresh interval', async () => {
    const wrapper = ({ children }) => (
      <ThemeProvider>
        <ProjectProvider>
          <RefreshProvider>{children}</RefreshProvider>
        </ProjectProvider>
      </ThemeProvider>
    )
    render(<SettingsPage />, { wrapper })

    await act(() => Promise.resolve())

    const input = screen.getByLabelText('Auto-refresh interval (minutes)')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue(5)

    fireEvent.change(input, { target: { value: '10' } })

    expect(input).toHaveValue(10)
  })
})