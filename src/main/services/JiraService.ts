import type { JiraConfig, JiraIssue, JiraProject, JiraSearchResult, JiraVersion } from '../../shared/jira-types'

export class JiraService {
  private config: JiraConfig | null = null

  setConfig(config: JiraConfig): void {
    this.config = config
  }

  private getAuthHeader(): string {
    if (!this.config) throw new Error('Jira config not set')
    const credentials = Buffer.from(`${this.config.email}:${this.config.apiToken}`).toString('base64')
    return `Basic ${credentials}`
  }

  private getBaseUrl(): string {
    if (!this.config) throw new Error('Jira config not set')
    const host = this.config.host.replace(/^https?:\/\//, '').replace(/\/$/, '')
    return `https://${host}/rest/api/3`
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.getBaseUrl()}${path}`
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: this.getAuthHeader(),
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options?.headers
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Jira API error ${response.status}: ${errorText}`)
    }

    return response.json() as Promise<T>
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.request('/myself')
      return true
    } catch {
      return false
    }
  }

  async getProjects(): Promise<JiraProject[]> {
    return this.request<JiraProject[]>('/project')
  }

  async getVersions(projectKey: string): Promise<JiraVersion[]> {
    return this.request<JiraVersion[]>(`/project/${projectKey}/versions`)
  }

  async searchIssues(jql: string, fields: string[], maxResults = 100): Promise<JiraIssue[]> {
    const allIssues: JiraIssue[] = []
    let nextPageToken: string | undefined

    do {
      const body: Record<string, unknown> = {
        jql,
        fields,
        expand: 'changelog',
        maxResults
      }
      if (nextPageToken) {
        body.nextPageToken = nextPageToken
      }

      const result = await this.request<JiraSearchResult>('/search/jql', {
        method: 'POST',
        body: JSON.stringify(body)
      })

      allIssues.push(...result.issues)
      nextPageToken = result.nextPageToken

      if (!nextPageToken) break
    } while (true)

    return allIssues
  }

  async getIssuesByVersion(projectKey: string, versionName: string): Promise<JiraIssue[]> {
    const jql = `project = "${projectKey}" AND fixVersion = "${versionName}" ORDER BY priority ASC`
    return this.searchIssues(jql, [
      'summary',
      'status',
      'issuetype',
      'priority',
      'created',
      'updated',
      'resolutiondate',
      'assignee',
      'reporter',
      'labels',
      'fixVersions',
      'components'
    ])
  }

  async getIssuesByJQL(jql: string): Promise<JiraIssue[]> {
    return this.searchIssues(jql, [
      'summary',
      'status',
      'issuetype',
      'priority',
      'created',
      'updated',
      'resolutiondate',
      'assignee',
      'reporter',
      'labels',
      'fixVersions',
      'components'
    ])
  }
}

export const jiraService = new JiraService()
