import { describe, it, expect } from 'vitest'
import { getStatusVariant } from '../src/shared/status-utils'

describe('getStatusVariant', () => {
  describe('Success (Green) - Completed statuses', () => {
    it('returns success for "Done"', () => {
      expect(getStatusVariant('Done')).toBe('success')
    })

    it('returns success for "Released"', () => {
      expect(getStatusVariant('Released')).toBe('success')
    })

    it('returns success for "Resolved"', () => {
      expect(getStatusVariant('Resolved')).toBe('success')
    })

    it('returns success for "Closed"', () => {
      expect(getStatusVariant('Closed')).toBe('success')
    })

    it('is case-insensitive for success', () => {
      expect(getStatusVariant('DONE')).toBe('success')
      expect(getStatusVariant('done')).toBe('success')
      expect(getStatusVariant('ReLeAsEd')).toBe('success')
    })
  })

  describe('Danger (Red) - Rejected statuses', () => {
    it('returns danger for "Rejected"', () => {
      expect(getStatusVariant('Rejected')).toBe('danger')
    })

    it('returns danger for "Won\'t Fix"', () => {
      expect(getStatusVariant("Won't Fix")).toBe('danger')
    })

    it('returns danger for "Cancelled"', () => {
      expect(getStatusVariant('Cancelled')).toBe('danger')
    })

    it('is case-insensitive for danger', () => {
      expect(getStatusVariant('REJECTED')).toBe('danger')
      expect(getStatusVariant('rejected')).toBe('danger')
    })

    it('handles partial matches for rejected', () => {
      expect(getStatusVariant('Rejected - Out of Scope')).toBe('danger')
    })
  })

  describe('Warning (Orange) - Work in progress', () => {
    it('returns warning for "In Progress"', () => {
      expect(getStatusVariant('In Progress')).toBe('warning')
    })

    it('returns warning for "Review"', () => {
      expect(getStatusVariant('Review')).toBe('warning')
    })

    it('returns warning for "Testing"', () => {
      expect(getStatusVariant('Testing')).toBe('warning')
    })

    it('returns warning for "Development"', () => {
      expect(getStatusVariant('Development')).toBe('warning')
    })

    it('returns warning for "Developer Testing"', () => {
      expect(getStatusVariant('Developer Testing')).toBe('warning')
    })

    it('returns warning for "Presa in carico"', () => {
      expect(getStatusVariant('Presa in carico')).toBe('warning')
    })

    it('is case-insensitive for warning', () => {
      expect(getStatusVariant('IN PROGRESS')).toBe('warning')
      expect(getStatusVariant('in progress')).toBe('warning')
    })
  })

  describe('Info (Blue) - New/Open statuses', () => {
    it('returns info for "Backlog"', () => {
      expect(getStatusVariant('Backlog')).toBe('info')
    })

    it('returns info for "Open"', () => {
      expect(getStatusVariant('Open')).toBe('info')
    })

    it('returns info for "New"', () => {
      expect(getStatusVariant('New')).toBe('info')
    })

    it('returns info for "To Do"', () => {
      expect(getStatusVariant('To Do')).toBe('info')
    })

    it('returns info for "TODO"', () => {
      expect(getStatusVariant('TODO')).toBe('info')
    })

    it('is case-insensitive for info', () => {
      expect(getStatusVariant('BACKLOG')).toBe('info')
      expect(getStatusVariant('open')).toBe('info')
    })
  })

  describe('Default (Gray) - Unknown statuses', () => {
    it('returns default for unknown status', () => {
      expect(getStatusVariant('Unknown Status')).toBe('default')
    })

    it('returns default for empty string', () => {
      expect(getStatusVariant('')).toBe('default')
    })

    it('returns default for "Waiting for support"', () => {
      expect(getStatusVariant('Waiting for support')).toBe('default')
    })

    it('returns default for "In pausa"', () => {
      expect(getStatusVariant('In pausa')).toBe('default')
    })
  })
})
