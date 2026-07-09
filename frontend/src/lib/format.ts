import type { Role } from '@/types/auth'

export function roleLabel(role?: Role) {
  if (!role) return 'Staff'
  return role.toLowerCase().replace(/^\w/, char => char.toUpperCase())
}

export function initialsFor(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}
