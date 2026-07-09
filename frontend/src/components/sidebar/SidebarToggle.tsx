import { Menu } from 'lucide-react'

/** Compact icon-only sidebar collapse/expand control — sits beside the logo. */
export default function SidebarToggle({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className="sidebar-toggle-button"
    >
      <Menu size={18} />
    </button>
  )
}
