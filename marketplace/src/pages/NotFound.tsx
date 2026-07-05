import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/Button'
import Container from '@/layout/Container'

export default function NotFound() {
  return (
    <Container className="grid justify-items-center gap-4 py-24 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
        <Compass size={24} />
      </span>
      <p className="font-serif text-5xl font-semibold text-ink">404</p>
      <h1 className="font-serif text-2xl font-semibold text-ink">Page not found</h1>
      <p className="max-w-sm text-ink-muted">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className={buttonVariants({ variant: 'primary' })}>
        Back to home
      </Link>
    </Container>
  )
}
