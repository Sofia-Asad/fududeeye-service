import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function SearchInput({ value, onChange, placeholder = 'Search', className }: SearchInputProps) {
  return (
    <label className={cn('relative block w-full', className)}>
      <span className="sr-only">{placeholder}</span>
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
      <input
        type="search"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-border-strong bg-surface pl-10 pr-3.5 text-sm text-ink placeholder:text-ink-faint focus-visible:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/30"
      />
    </label>
  )
}
