import type { ReactNode } from 'react'

export interface AuthHeaderProps {
  title: string
  description?: ReactNode
  align?: 'left' | 'center'
}

export default function AuthHeader({ title, description, align = 'left' }: AuthHeaderProps) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}
    </div>
  )
}
