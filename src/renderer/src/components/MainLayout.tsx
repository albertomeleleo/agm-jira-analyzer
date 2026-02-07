import { useState } from 'react'
import { Sidebar, type NavPage } from '@design-system'
import { SLADashboard } from './SLADashboard'
import { ReleaseDetail } from './ReleaseDetail'
import { SettingsPage } from './SettingsPage'
import { HelpPage } from './HelpPage'

export function MainLayout(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard')

  const renderPage = (): JSX.Element => {
    switch (currentPage) {
      case 'dashboard':
        return <SLADashboard />
      case 'releases':
        return <ReleaseDetail />
      case 'settings':
        return <SettingsPage />
      case 'help':
        return <HelpPage />
    }
  }

  return (
    <div className="flex h-screen bg-brand-deep">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-y-auto">{renderPage()}</main>
    </div>
  )
}
