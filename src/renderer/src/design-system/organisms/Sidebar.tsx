import { useState } from 'react'
import {
  LayoutDashboard,
  Package,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  FolderOpen
} from 'lucide-react'
import { ThemeToggle } from '../atoms/ThemeToggle'
import { useProject } from '../../contexts/ProjectContext'
import logoSrc from '../../assets/logo.png'

export type NavPage = 'dashboard' | 'releases' | 'settings' | 'help'

interface SidebarProps {
  currentPage: NavPage
  onNavigate: (page: NavPage) => void
}

interface NavItem {
  id: NavPage
  label: string
  icon: typeof LayoutDashboard
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'SLA Dashboard', icon: LayoutDashboard },
  { id: 'releases', label: 'Releases', icon: Package },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Help', icon: HelpCircle }
]

export function Sidebar({ currentPage, onNavigate }: SidebarProps): JSX.Element {
  const [collapsed, setCollapsed] = useState(false)
  const { projects, activeProject, setActiveProject } = useProject()

  return (
    <aside
      className={`flex flex-col h-full glass border-r border-white/10 transition-all duration-300
        ${collapsed ? 'w-16' : 'w-60'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 drag-region">
        <img
          src={logoSrc}
          alt="AGMS"
          className={`no-drag object-contain transition-all duration-300 ${collapsed ? 'w-8 h-8' : 'h-8'}`}
        />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-brand-card/80 text-brand-text-sec no-drag"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Project selector */}
      {!collapsed && (
        <div className="px-3 mb-3">
          <div className="glass rounded-lg p-2">
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen size={14} className="text-brand-cyan" />
              <span className="text-xs font-medium text-brand-text-sec">Project</span>
            </div>
            {projects.length > 0 ? (
              <select
                value={activeProject?.name ?? ''}
                onChange={(e) => {
                  const proj = projects.find((p) => p.name === e.target.value)
                  setActiveProject(proj ?? null)
                }}
                className="w-full px-2 py-1 rounded text-sm bg-brand-deep/60 border border-white/10
                  text-brand-text-pri focus:outline-none focus:border-brand-cyan/40"
              >
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-1 text-xs text-brand-text-sec/60">
                <Plus size={12} />
                <span>No projects</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                ${
                  isActive
                    ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20'
                    : 'text-brand-text-sec hover:text-brand-text-pri hover:bg-brand-card/60 border border-transparent'
                }
                ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={`p-3 border-t border-white/10 ${collapsed ? 'flex justify-center' : ''}`}>
        <ThemeToggle />
      </div>
    </aside>
  )
}
