import { useQuery } from '@tanstack/react-query'
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  type LucideIcon,
} from 'lucide-react'

// Company office location (Garsoor District, Galkayo, Mudug, Somalia).
const GALKAYO_LAT = 6.7697
const GALKAYO_LON = 47.4247

interface OpenMeteoResponse {
  current_weather: {
    temperature: number
    weathercode: number
    is_day: 0 | 1
  }
}

export interface WeatherReading {
  temperature: number
  label: string
  icon: LucideIcon
}

/** Maps a WMO weather code (https://open-meteo.com/en/docs) to a compact icon + label. */
function describeWeather(code: number, isDay: boolean): { label: string; icon: LucideIcon } {
  if (code === 0) return { label: 'Clear', icon: isDay ? Sun : Cloud }
  if (code === 1 || code === 2) return { label: 'Partly cloudy', icon: isDay ? CloudSun : Cloud }
  if (code === 3) return { label: 'Overcast', icon: Cloud }
  if (code === 45 || code === 48) return { label: 'Foggy', icon: CloudFog }
  if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Drizzle', icon: CloudDrizzle }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Rain', icon: CloudRain }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Snow', icon: CloudSnow }
  if ([95, 96, 99].includes(code)) return { label: 'Storm', icon: CloudLightning }
  return { label: 'Weather', icon: Cloud }
}

async function fetchGalkayoWeather(): Promise<WeatherReading> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${GALKAYO_LAT}&longitude=${GALKAYO_LON}&current_weather=true`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Weather request failed.')
  const data = (await response.json()) as OpenMeteoResponse
  const { label, icon } = describeWeather(data.current_weather.weathercode, data.current_weather.is_day === 1)
  return { temperature: Math.round(data.current_weather.temperature), label, icon }
}

/** Current weather for the Galkayo office — public Open-Meteo API, no key required. */
export function useWeather() {
  return useQuery({
    queryKey: ['topnav-weather', 'galkayo'],
    queryFn: fetchGalkayoWeather,
    staleTime: 30 * 60_000,
    retry: 1,
  })
}
