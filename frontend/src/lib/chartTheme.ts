export const CHART_COLORS = {
  primary: '#1A2057',
  gold: '#F2B705',
  info: '#3D5AA8',
  danger: '#C2482F',
  neutralFill: '#E8DDC4',
  grid: '#EFEDE4',
  tick: '#75806F',
} as const

export const chartAxisTick = { fill: CHART_COLORS.tick, fontSize: 12 }

export const chartTooltipStyle = {
  borderRadius: 12,
  borderColor: '#ECEADF',
  fontFamily: 'Jost',
}

export const chartLegendStyle = { fontSize: 12.5 }

export const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function moneyTooltip(value: unknown, name: unknown) {
  return [compactMoney.format(Number(value)), String(name)]
}

export function moneyShort(value: string | number) {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    notation: Math.abs(numberValue) >= 10000 ? 'compact' : 'standard',
  }).format(numberValue)
}
