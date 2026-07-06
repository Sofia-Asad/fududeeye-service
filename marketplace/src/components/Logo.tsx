import logoSrc from '@/assets/fududeeye logo.jpeg'

export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-md bg-white shadow-sm"
      style={{ width: size, height: size }}
    >
      <img src={logoSrc} alt="Fududeeye" style={{ width: '82%', height: '82%', objectFit: 'contain' }} />
    </span>
  )
}
