import { useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown, Search } from 'lucide-react'

/** Generic searchable combobox — type to filter, click a row to select, custom rendering per row. Reusable anywhere a plain `<select>` isn't rich enough. */
export default function SearchableSelect<T>({
  options,
  value,
  getId,
  getLabel,
  renderOption,
  onSelect,
  onQueryChange,
  renderEmpty,
  placeholder = 'Search...',
  emptyLabel = 'No results found.',
  error,
}: {
  options: T[]
  value: string
  getId: (item: T) => string
  getLabel: (item: T) => string
  renderOption: (item: T) => ReactNode
  onSelect: (item: T) => void
  /** Fires on every keystroke — lets a parent drive a server-side search instead of (or alongside) the built-in client-side filter. */
  onQueryChange?: (query: string) => void
  /** Overrides the default "no results" block, e.g. to surface a Quick Add action. Receives the current typed query. */
  renderEmpty?: (query: string) => ReactNode
  placeholder?: string
  emptyLabel?: string
  error?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = useMemo(() => options.find(option => getId(option) === value), [options, value, getId])

  const filtered = useMemo(() => {
    if (!query.trim()) return options
    const needle = query.trim().toLowerCase()
    return options.filter(option => getLabel(option).toLowerCase().includes(needle))
  }, [options, query, getLabel])

  function openDropdown() {
    setQuery('')
    onQueryChange?.('')
    setOpen(true)
  }

  function changeQuery(next: string) {
    setQuery(next)
    onQueryChange?.(next)
    // Typing after a selection (e.g. to search for something else) doesn't
    // re-focus the input — it's already focused, since selecting an option
    // deliberately keeps focus there. Without this, `open` stays false and
    // the displayed value keeps snapping back to the selected label instead
    // of showing what was just typed.
    setOpen(true)
  }

  function select(item: T) {
    onSelect(item)
    setQuery('')
    onQueryChange?.('')
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'relative', display: 'block' }}>
        <Search size={15} style={{ position: 'absolute', left: 13, top: 0, bottom: 0, margin: 'auto', color: 'var(--muted)', pointerEvents: 'none' }} />
        <input
          ref={inputRef}
          className="control"
          style={{ width: '100%', padding: '0 34px 0 38px', borderColor: error ? 'var(--danger)' : undefined }}
          value={open ? query : (selected ? getLabel(selected) : '')}
          placeholder={selected && !open ? undefined : placeholder}
          onFocus={openDropdown}
          onChange={event => changeQuery(event.target.value)}
        />
        <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: 0, bottom: 0, margin: 'auto', color: 'var(--text-faint)', pointerEvents: 'none', transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 200ms ease' }} />
      </span>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 20 }}
            onMouseDown={() => setOpen(false)}
          />
          <div
            className="card searchable-select-dropdown"
            style={{
              position: 'absolute',
              zIndex: 21,
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              maxHeight: 260,
              overflowY: 'auto',
              padding: 6,
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {filtered.length === 0 && (
              renderEmpty ? renderEmpty(query) : (
                <div style={{ padding: '14px 12px', color: 'var(--muted)', fontSize: 12.5, textAlign: 'center' }}>{emptyLabel}</div>
              )
            )}
            {filtered.map(option => (
              <button
                key={getId(option)}
                type="button"
                onMouseDown={event => event.preventDefault()}
                onClick={() => select(option)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: getId(option) === value ? 'var(--primary-soft)' : 'transparent',
                  borderRadius: 10,
                  padding: '8px 10px',
                  cursor: 'pointer',
                  font: 'inherit',
                }}
                onMouseEnter={event => { if (getId(option) !== value) event.currentTarget.style.background = 'var(--thead-bg)' }}
                onMouseLeave={event => { if (getId(option) !== value) event.currentTarget.style.background = 'transparent' }}
              >
                {renderOption(option)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
