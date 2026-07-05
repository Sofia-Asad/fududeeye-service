import type { ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'

export interface SuccessStateProps {
  title: string
  description?: ReactNode
  action?: ReactNode
  icon?: ReactNode
}

export default function SuccessState({ title, description, action, icon }: SuccessStateProps) {
  return (
    <div className="grid justify-items-center gap-4 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-success-soft text-success">
        {icon ?? <CheckCircle2 size={32} aria-hidden="true" />}
      </span>
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
      {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-2 w-full">{action}</div>}
    </div>
  )
}
