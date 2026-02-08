import { useInterval } from './useInterval'
import { useRefresh } from '../contexts/RefreshContext'

export function useAutoRefresh(onRefresh: () => void, lastJql: string | null) {
  const { autoRefreshInterval } = useRefresh()

  const isRefreshEnabled = autoRefreshInterval > 0 && !!lastJql

  useInterval(
    () => {
      onRefresh()
    },
    isRefreshEnabled ? autoRefreshInterval * 60 * 1000 : null
  )
}
