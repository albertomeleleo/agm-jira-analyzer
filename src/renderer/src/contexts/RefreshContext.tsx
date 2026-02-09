import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode
} from 'react'
import type { AppSettings } from '../../../shared/project-types'

interface RefreshContextValue {
  autoRefreshInterval: number
  setAutoRefreshInterval: (interval: number) => void
}

const RefreshContext = createContext<RefreshContextValue | null>(null)

export function RefreshProvider({ children }: { children: ReactNode }): JSX.Element {
  const [autoRefreshInterval, setAutoRefreshIntervalState] = useState(5)

  useEffect(() => {
    window.api.getSettings().then((settings: AppSettings) => {
      setAutoRefreshIntervalState(settings.autoRefreshInterval)
    })
  }, [])

  const setAutoRefreshInterval = useCallback((interval: number) => {
    setAutoRefreshIntervalState(interval)
    window.api.updateSettings({ autoRefreshInterval: interval })
  }, [])

  return (
    <RefreshContext.Provider
      value={{ autoRefreshInterval, setAutoRefreshInterval }}
    >
      {children}
    </RefreshContext.Provider>
  )
}

export function useRefresh(): RefreshContextValue {
  const context = useContext(RefreshContext)
  if (!context) throw new Error('useRefresh must be used within RefreshProvider')
  return context
}
