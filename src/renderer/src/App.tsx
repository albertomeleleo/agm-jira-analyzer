import { useState, useEffect } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProjectProvider, useProject } from './contexts/ProjectContext'
import { OnboardingWizard } from './components/Onboarding/OnboardingWizard'
import { MainLayout } from './components/MainLayout'

function AppContent(): JSX.Element {
  const { projects, loading } = useProject()
  const [onboarded, setOnboarded] = useState<boolean | null>(null)

  useEffect(() => {
    if (!loading) {
      setOnboarded(projects.length > 0)
    }
  }, [projects, loading])

  if (loading || onboarded === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-deep">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-brand-text-sec">Loading...</span>
        </div>
      </div>
    )
  }

  if (!onboarded) {
    return <OnboardingWizard onComplete={() => setOnboarded(true)} />
  }

  return <MainLayout />
}

export default function App(): JSX.Element {
  return (
    <ThemeProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </ThemeProvider>
  )
}
