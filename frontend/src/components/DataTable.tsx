import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  align?: 'left' | 'right'
  render: (row: T) => ReactNode
}

export default function DataTable<T>({
  columns,
  rows,
  empty = 'No records found.',
  variant = 'card',
}: {
  columns: Column<T>[]
  rows: T[]
  empty?: string
  variant?: 'card' | 'bare'
}) {
  const emptyState = rows.length === 0 && (
    <div style={{ padding: '42px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
      {empty}
    </div>
  )

  const table = (
    <div className="data-table-desktop" style={{ overflowX: variant === 'bare' ? 'auto' : undefined }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr style={{ background: 'var(--thead-bg)' }}>
            {columns.map(column => (
              <th
                key={column.key}
                style={{
                  textAlign: column.align ?? 'left',
                  padding: '11px 16px',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  color: 'var(--text-faint)',
                  borderTop: '1px solid var(--row-line)',
                  borderBottom: '1px solid var(--row-line)',
                  whiteSpace: 'nowrap',
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              style={{ transition: 'background-color 150ms ease' }}
              onMouseEnter={event => { event.currentTarget.style.background = 'var(--thead-bg)' }}
              onMouseLeave={event => { event.currentTarget.style.background = 'transparent' }}
            >
              {columns.map(column => (
                <td
                  key={column.key}
                  style={{
                    padding: '13px 16px',
                    fontSize: 13.5,
                    color: 'var(--text-mid)',
                    textAlign: column.align ?? 'left',
                    borderBottom: '1px solid var(--row-line)',
                    verticalAlign: 'middle',
                  }}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {emptyState}
    </div>
  )

  const mobileCards = (
    <div className="data-table-mobile">
      {rows.map((row, index) => {
        const [leadColumn, ...detailColumns] = columns
        return (
          <article key={index} className="mobile-record-card">
            {leadColumn && (
              <div className="mobile-record-lead">
                {leadColumn.render(row)}
              </div>
            )}
            {detailColumns.map(column => (
              <div key={column.key} className="mobile-record-row">
                <div className="mobile-record-label">{column.header}</div>
                <div className="mobile-record-value" style={{ textAlign: column.align === 'right' ? 'right' : undefined }}>
                  {column.render(row)}
                </div>
              </div>
            ))}
          </article>
        )
      })}
      {emptyState}
    </div>
  )

  const content = (
    <>
      {table}
      {mobileCards}
    </>
  )

  if (variant === 'bare') {
    return (
      <div>
        {content}
      </div>
    )
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {content}
    </div>
  )
}
