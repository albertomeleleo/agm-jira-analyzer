import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export function ThemeToggle(): JSX.Element {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-brand-card/60 border border-white/10
        hover:bg-brand-card/80 hover:border-brand-cyan/20
        transition-all duration-200 text-brand-text-sec hover:text-brand-text-pri"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
