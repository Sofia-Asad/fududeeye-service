import { Mail } from 'lucide-react'

export interface EmailSentCardProps {
  email: string
}

export default function EmailSentCard({ email }: EmailSentCardProps) {
  return (
    <div className="grid justify-items-center gap-4 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-gold-soft text-gold-hover">
        <Mail size={30} aria-hidden="true" />
      </span>
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">Check Your Email</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        We&rsquo;ve sent a password reset link to
        <br />
        <span className="font-semibold text-ink">{email}</span>
      </p>
    </div>
  )
}
