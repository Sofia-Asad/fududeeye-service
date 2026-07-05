import { useCallback, useState } from 'react'

/** Tracks open/closed boolean state for modals, menus, and drawers. */
export function useDisclosure(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(current => !current), [])

  return { isOpen, open, close, toggle }
}
