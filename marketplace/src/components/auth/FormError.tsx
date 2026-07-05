import { AlertCircle } from 'lucide-react'

export default function FormError({ message }: { message?: string | null }) {
  if (!message) return null

  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-md border border-danger-soft bg-danger-soft/60 px-4 py-3 text-sm text-danger">
      <AlertCircle size={17} aria-hidden="true" className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
