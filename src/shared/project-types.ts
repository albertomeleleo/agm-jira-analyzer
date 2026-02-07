import type { JiraConfig } from './jira-types'
import type { SLATarget } from './sla-types'

export interface SLAGroup {
  name: string
  priorities: string[]
  target: SLATarget
}

export interface ProjectConfig {
  name: string
  jiraProjectKey: string
  jira: JiraConfig
  slaGroups: SLAGroup[]
  excludeLunchBreak?: boolean
  logoPath?: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  name: string
  path: string
  config: ProjectConfig
}

export interface AppSettings {
  storageRoot: string
  theme: 'light' | 'dark'
  lastOpenedProject?: string
}

export const DEFAULT_SLA_GROUPS: SLAGroup[] = [
  {
    name: 'Expedite',
    priorities: ['Highest', 'Critical'],
    target: { reactionMinutes: 15, resolutionMinutes: 240 }
  },
  {
    name: 'Critical',
    priorities: ['High'],
    target: { reactionMinutes: 15, resolutionMinutes: 480 }
  },
  {
    name: 'Major',
    priorities: ['Medium'],
    target: { reactionMinutes: 15, resolutionMinutes: 960 }
  },
  {
    name: 'Minor',
    priorities: ['Low'],
    target: { reactionMinutes: 15, resolutionMinutes: 1920 }
  },
  {
    name: 'Trivial',
    priorities: ['Lowest'],
    target: { reactionMinutes: 15, resolutionMinutes: 2400 }
  }
]
