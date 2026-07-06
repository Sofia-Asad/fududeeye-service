import logoSrc from '@/assets/fududeeye logo.jpeg'

/** Brand mark — a small white chip so the logo reads cleanly on both light and navy surfaces. */
export default function Logo({ size = 38 }: { size?: number }) {
  return (
    <span
      style={{
        display: 'grid',
        placeItems: 'center',
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: '#fff',
        boxShadow: '0 2px 8px rgba(20,29,68,.18)',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <img src={logoSrc} alt="Fududeeye" style={{ width: '82%', height: '82%', objectFit: 'contain' }} />
    </span>
  )
}
