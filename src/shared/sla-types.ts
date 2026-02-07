export interface SLATarget {
  reactionMinutes: number
  resolutionMinutes: number
}

export interface SLATier {
  name: string
  label: string
  target: SLATarget
}

export interface SLASegment {
  status: string
  startTime: string
  endTime: string
  durationMinutes: number
  isPause: boolean
  isWork: boolean
}

export interface SLAIssue {
  key: string
  summary: string
  issueType: string
  priority: string
  slaTier: string
  created: string
  resolved: string | null
  assignee: string | null

  reactionTimeMinutes: number | null
  reactionTargetMinutes: number | null
  reactionSLAMet: boolean | null

  resolutionTimeMinutes: number | null
  resolutionNetMinutes: number | null
  resolutionTargetMinutes: number | null
  resolutionSLAMet: boolean | null

  reactionRemainingMinutes: number | null
  resolutionRemainingMinutes: number | null

  timeInPauseMinutes: number
  pauseSegments: SLASegment[]
  segments: SLASegment[]

  is24x7: boolean
  status: string
  labels: string[]
  fixVersions: string[]
}

export interface SLAReport {
  generatedAt: string
  projectKey: string
  totalIssues: number
  issues: SLAIssue[]
  summary: SLASummary
}

export interface SLASummary {
  totalIssues: number
  resolvedIssues: number
  openIssues: number
  reactionCompliance: number
  resolutionCompliance: number
  reactionMet: number
  reactionMissed: number
  resolutionMet: number
  resolutionMissed: number
  byPriority: Record<string, SLAPrioritySummary>
  byType: Record<string, number>
}

export interface SLAPrioritySummary {
  total: number
  reactionMet: number
  reactionMissed: number
  resolutionMet: number
  resolutionMissed: number
  reactionCompliance: number
  resolutionCompliance: number
}
