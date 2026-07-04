export function SkeletonLines({ widths = ['36%', '68%'] }: { widths?: string[] }) {
  return (
    <section className="card" style={{ padding: 22, display: 'grid', gap: 14 }}>
      {widths.map((width, index) => (
        <span key={index} className="skeleton-row" style={{ width }} />
      ))}
    </section>
  )
}
