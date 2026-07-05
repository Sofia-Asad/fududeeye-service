import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const avatarVariants = cva(
  'grid shrink-0 place-items-center rounded-full bg-primary-soft font-semibold text-primary',
  {
    variants: {
      size: {
        sm: 'h-9 w-9 text-xs',
        md: 'h-12 w-12 text-sm',
        lg: 'h-14 w-14 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  name: string
  className?: string
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

/** Circular initials avatar used where no photo is available. */
export default function Avatar({ name, size, className }: AvatarProps) {
  return (
    <span aria-hidden="true" className={cn(avatarVariants({ size }), className)}>
      {getInitials(name)}
    </span>
  )
}
