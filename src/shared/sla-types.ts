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
  reactionStart: string | null

  resolutionTimeMinutes: number | null
  resolutionNetMinutes: number | null
  resolutionTargetMinutes: number | null
  resolutionSLAMet: boolean | null
  resolutionStart: string | null

  reactionRemainingMinutes: number | null
  resolutionRemainingMinutes: number | null

  timeInPauseMinutes: number
  timeInDependencyMinutes: number
  timeInNonWorkingDaysMinutes: number
  pauseSegments: SLASegment[]
  dependencySegments: SLASegment[]
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
  excludeLunchBreak: boolean
}

export interface SLASummary {
  totalIssues: number
  resolvedIssues: number
  openIssues: number
  rejectedIssues: number
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
  rejected: number
  reactionMet: number
  reactionMissed: number
  resolutionMet: number
  resolutionMissed: number
  reactionCompliance: number
  resolutionCompliance: number
}

export interface WeeklyCount {
  week: string // e.g., "2026-W05"
  open: number
  closed: number
}

export interface SlaCompliance {
  inSla: number
  outOfSla: number
}

export interface PieChartDataPoint {
  name: string
  value: number
}

export interface SlaMetrics {
  tasks: WeeklyCount[]
  bugsAndRequests: WeeklyCount[]
  responseTimeSla: SlaCompliance
  resolutionTimeSla: SlaCompliance
  issueTypeDistribution: PieChartDataPoint[]
  priorityDistribution: PieChartDataPoint[]
}
