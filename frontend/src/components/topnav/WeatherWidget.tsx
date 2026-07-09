import { useWeather } from '@/hooks/useWeather'

/** Live current weather for the Galkayo office — fetched from Open-Meteo (no API key required). */
export default function WeatherWidget() {
  const weather = useWeather()

  if (weather.isPending) {
    return (
      <div
        aria-hidden="true"
        style={{ width: 84, height: 38, borderRadius: 12, background: 'var(--thead-bg)' }}
      />
    )
  }

  // Fail quietly — a broken weather API call shouldn't degrade the rest of the top nav.
  if (weather.isError || !weather.data) return null

  const Icon = weather.data.icon

  return (
    <div
      title={`${weather.data.label} in Galkayo`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 38,
        padding: '0 12px',
        borderRadius: 12,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        color: 'var(--text-mid)',
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <Icon size={17} style={{ color: 'var(--accent-dark)', flexShrink: 0 }} />
      <span>{weather.data.temperature}&deg;C</span>
    </div>
  )
}
