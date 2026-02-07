import { Search } from 'lucide-react'
import { type InputHTMLAttributes } from 'react'

interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onSearch?: (value: string) => void
}

export function SearchField({
  onSearch,
  className = '',
  ...props
}: SearchFieldProps): JSX.Element {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-sec/50"
      />
      <input
        type="text"
        className="w-full pl-9 pr-3 py-2 rounded-lg text-sm
          bg-brand-card/80 border border-white/10
          text-brand-text-pri placeholder:text-brand-text-sec/50
          focus:outline-none focus:border-brand-cyan/40 focus:ring-1 focus:ring-brand-cyan/20
          transition-all duration-200"
        onChange={(e) => onSearch?.(e.target.value)}
        {...props}
      />
    </div>
  )
}
