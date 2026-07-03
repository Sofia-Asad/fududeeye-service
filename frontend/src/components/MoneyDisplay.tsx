const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export default function MoneyDisplay({ value }: { value: string | number }) {
  return <span className="money">{formatter.format(Number(value))}</span>
}
