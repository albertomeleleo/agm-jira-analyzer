import { useState, useEffect } from 'react'

/**
 * Hook that provides current timestamp, updating every 60 seconds
 * Used for real-time SLA remaining time calculations
 */
export function useRemainingTime(): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 60000) // Update every 60 seconds

    return () => clearInterval(interval)
  }, [])

  return now
}
