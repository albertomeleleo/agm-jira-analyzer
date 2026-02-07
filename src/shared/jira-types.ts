export interface JiraConfig {
  host: string
  email: string
  apiToken: string
}

export interface JiraStatusChange {
  field: string
  fromString: string | null
  toString: string | null
  from: string | null
  to: string | null
}

export interface JiraHistoryItem {
  id: string
  created: string
  items: JiraStatusChange[]
  author: {
    displayName: string
    emailAddress: string
  }
}

export interface JiraChangelog {
  histories: JiraHistoryItem[]
}

export interface JiraIssueFields {
  summary: string
  status: {
    name: string
    id: string
  }
  issuetype: {
    name: string
    id: string
    subtask: boolean
  }
  priority: {
    name: string
    id: string
  }
  created: string
  updated: string
  resolutiondate: string | null
  assignee: {
    displayName: string
    emailAddress: string
  } | null
  reporter: {
    displayName: string
    emailAddress: string
  } | null
  labels: string[]
  fixVersions: {
    id: string
    name: string
    released: boolean
    releaseDate?: string
  }[]
  components: {
    name: string
  }[]
}

export interface JiraIssue {
  id: string
  key: string
  self: string
  fields: JiraIssueFields
  changelog: JiraChangelog
}

export interface JiraProject {
  id: string
  key: string
  name: string
  avatarUrls: Record<string, string>
}

export interface JiraVersion {
  id: string
  name: string
  released: boolean
  releaseDate?: string
  projectId: number
  description?: string
}

export interface JiraSearchResult {
  total: number
  maxResults: number
  issues: JiraIssue[]
  nextPageToken?: string
}
