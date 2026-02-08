import { projectService } from './ProjectService'
import { calculateSlaMetrics } from '../../shared/sla-calculations'
import type { SlaMetrics } from '../../shared/sla-types'

export class SlaMetricsService {
  getSlaMetrics(projectName: string): SlaMetrics | null {
    const report = projectService.getSLACache(projectName)
    if (!report) return null
    return calculateSlaMetrics(report.issues)
  }
}

export const slaMetricsService = new SlaMetricsService()
