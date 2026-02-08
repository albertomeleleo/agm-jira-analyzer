import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Project } from '../../../shared/project-types'

interface ProjectContextValue {
  projects: Project[]
  activeProject: Project | null
  setActiveProject: (project: Project | null) => void
  refreshProjects: () => Promise<void>
  loading: boolean
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

export function ProjectProvider({ children }: { children: ReactNode }): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProject, setActiveProjectState] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProjects = useCallback(async () => {
    setLoading(true)
    try {
      const list = await window.api.getProjects()
      setProjects(list)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshProjects().then(async () => {
      const settings = await window.api.getSettings()
      if (settings.lastOpenedProject) {
        const project = await window.api.getProject(settings.lastOpenedProject)
        if (project) setActiveProjectState(project)
      }
    })
  }, [refreshProjects])

  useEffect(() => {
    if (activeProject) {
      const updated = projects.find((p) => p.name === activeProject.name)
      if (updated && updated !== activeProject) {
        setActiveProjectState(updated)
      }
    }
  }, [projects, activeProject])

  const setActiveProject = useCallback(
    (project: Project | null) => {
      setActiveProjectState(project)
      if (project) {
        window.api.updateSettings({ lastOpenedProject: project.name })
      }
    },
    []
  )

  return (
    <ProjectContext.Provider
      value={{ projects, activeProject, setActiveProject, refreshProjects, loading }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject(): ProjectContextValue {
  const context = useContext(ProjectContext)
  if (!context) throw new Error('useProject must be used within ProjectProvider')
  return context
}
