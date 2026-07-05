import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, HandCoins, ReceiptText, UserRound, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { listPendingPayouts, markSalePaid } from '@/api/sales'
import { useAuth } from '@/auth/AuthContext'
import EmptyState from '@/components/EmptyState'
import Layout from '@/components/Layout'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import PermissionGate from '@/components/PermissionGate'
import { SkeletonLines } from '@/components/Skeleton'
import SummaryCard from '@/components/SummaryCard'
import { errorMessage } from '@/lib/errors'
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS, formatDate, initials, todayISO } from '@/lib/sales'
import { notifyError, notifySuccess } from '@/lib/toast'
import { useEscapeToClose } from '@/lib/useEscapeToClose'
import type { PaymentMethod, PendingPayoutRow } from '@/types/sales'

interface PayoutGroup {
  ownerId: number | null
  owner: string
  total: number
  rows: PendingPayoutRow[]
}

function groupRows(rows: PendingPayoutRow[]) {
  const groups = new Map<string, PayoutGroup>()
  rows.forEach(row => {
    const key = row.owner_id === null ? 'none' : String(row.owner_id)
    const existing = groups.get(key) ?? {
      ownerId: row.owner_id,
      owner: row.owner || 'Unknown owner',
      total: 0,
      rows: [],
    }
    existing.total += Number(row.amount)
    existing.rows.push(row)
    groups.set(key, existing)
  })
  return [...groups.values()].sort((a, b) => a.owner.localeCompare(b.owner))
}

export default function PendingPayouts() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [modalGroup, setModalGroup] = useState<PayoutGroup | null>(null)
  const [payoutMethod, setPayoutMethod] = useState<PaymentMethod>('CASH')
  const [payoutDate, setPayoutDate] = useState(todayISO())

  const payouts = useQuery({
    queryKey: ['pending-payouts'],
    queryFn: listPendingPayouts,
    enabled: !!user?.can_view_finance,
  })

  useEscapeToClose(!!modalGroup, () => setModalGroup(null))

  const groups = useMemo(() => groupRows(payouts.data?.results ?? []), [payouts.data?.results])
  const largestGroup = groups.reduce<PayoutGroup | null>((largest, group) => (!largest || group.total > largest.total ? group : largest), null)

  const markGroupPaid = useMutation({
    mutationFn: async (group: PayoutGroup) => {
      if (!user) {
        throw new Error('Missing user.')
      }
      await Promise.all(group.rows.map(row => markSalePaid(row.sale_id, {
        payout_method: payoutMethod,
        payout_date: payoutDate,
        payout_handled_by: user.id,
      })))
    },
    onSuccess: () => {
      setModalGroup(null)
      void queryClient.invalidateQueries({ queryKey: ['pending-payouts'] })
      void queryClient.invalidateQueries({ queryKey: ['sales'] })
      notifySuccess('Payout completed')
    },
    onError: error => notifyError(errorMessage(error)),
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (modalGroup) {
      markGroupPaid.mutate(modalGroup)
    }
  }

  return (
    <Layout>
      <PermissionGate minRole="MANAGER" fallback={
        <div className="app-page">
          <div className="card" style={{ padding: 22, color: 'var(--muted)' }}>Your role cannot view owner payouts.</div>
        </div>
      }>
        <div className="app-page">
          <PageHeader
            eyebrow="Money"
            title="Pending payouts"
            subtitle="Owner payout queue grouped by consignment seller."
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
            <SummaryCard label="Total owed" value={<MoneyDisplay value={payouts.data?.total ?? 0} />} caption={`${payouts.data?.count ?? 0} sale payouts`} icon={<HandCoins size={18} />} tone="red" valueColor="var(--money-owed)" />
            <SummaryCard label="Owners owed" value={groups.length} caption="Grouped recipients" icon={<UserRound size={18} />} />
            <SummaryCard label="Largest owner" value={largestGroup ? largestGroup.owner : '-'} caption={largestGroup ? <MoneyDisplay value={largestGroup.total} /> : 'No open payouts'} icon={<HandCoins size={18} />} tone="amber" />
            <SummaryCard label="Rows" value={payouts.data?.results.length ?? 0} caption="Pending sale rows" icon={<ReceiptText size={18} />} tone="blue" />
          </div>

          {payouts.isLoading && <SkeletonLines widths={['60%', '84%', '48%']} />}
          {payouts.isError && (
            <div className="error-banner">{errorMessage(payouts.error)}</div>
          )}
          {payouts.data && groups.length === 0 && (
            <section className="card">
              <EmptyState icon={<HandCoins size={18} />} title="No pending payouts." subtitle="Every consignment owner is paid up for now." />
            </section>
          )}
          {groups.length > 0 && (
            <div style={{ display: 'grid', gap: 14 }}>
              {groups.map(group => (
                <section key={group.ownerId ?? 'none'} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderBottom: '1px solid var(--row-line)' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 999, background: 'var(--primary-soft)', color: 'var(--primary-hover)', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                      {initials(group.owner)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'var(--text)', fontSize: 15, fontWeight: 700 }}>{group.owner}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{group.rows.length} sale{group.rows.length === 1 ? '' : 's'} awaiting payout</div>
                    </div>
                    <div style={{ textAlign: 'right', marginRight: 4 }}>
                      <div className="serif" style={{ fontSize: 22, fontWeight: 700, color: 'var(--money-owed)' }}><MoneyDisplay value={group.total} /></div>
                    </div>
                    <button type="button" onClick={() => setModalGroup(group)} className="primary-button">
                      <CheckCircle2 size={16} />
                      Mark paid
                    </button>
                  </div>
                  {group.rows.map((row, index) => (
                    <div key={row.sale_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '12px 18px 12px 74px', borderTop: index > 0 ? '1px solid var(--row-line)' : undefined, background: 'var(--thead-bg)' }}>
                      <div>
                        <Link to={`/sales/${row.sale_id}`} style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}>{row.item}</Link>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Sold {formatDate(row.sale_date)}</div>
                      </div>
                      <div style={{ color: 'var(--money-owed)' }}><MoneyDisplay value={row.amount} /></div>
                    </div>
                  ))}
                </section>
              ))}
            </div>
          )}
        </div>

        {modalGroup && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center', background: 'rgba(34,48,42,.34)', padding: 20 }} onClick={() => setModalGroup(null)}>
            <form onSubmit={submit} className="card" style={{ width: 'min(440px, 100%)', overflow: 'hidden' }} onClick={event => event.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '22px 24px', borderBottom: '1px solid var(--row-line)' }}>
                <div>
                  <h2 className="serif" style={{ margin: 0, fontSize: 25, lineHeight: 1.1 }}>Mark payout paid</h2>
                  <p style={{ margin: '5px 0 0', fontSize: 13, color: 'var(--muted)' }}>{modalGroup.owner} · <MoneyDisplay value={modalGroup.total} /></p>
                </div>
                <button type="button" onClick={() => setModalGroup(null)} className="secondary-button" style={{ width: 38, padding: 0 }} aria-label="Close">
                  <X size={16} />
                </button>
              </div>

              <div style={{ padding: '22px 24px', display: 'grid', gap: 16 }}>
                <label className="field-label">
                  <span className="field-title">Payment method</span>
                  <select autoFocus className="control" value={payoutMethod} onChange={event => setPayoutMethod(event.target.value as PaymentMethod)} style={{ width: '100%', padding: '0 12px' }}>
                    {PAYMENT_METHODS.map(method => (
                      <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method]}</option>
                    ))}
                  </select>
                </label>
                <label className="field-label">
                  <span className="field-title">Payment date</span>
                  <input className="control" type="date" value={payoutDate} onChange={event => setPayoutDate(event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
                </label>
                {markGroupPaid.isError && (
                  <div className="error-banner">{errorMessage(markGroupPaid.error)}</div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid var(--row-line)' }}>
                <button type="button" onClick={() => setModalGroup(null)} className="secondary-button">Cancel</button>
                <button type="submit" disabled={markGroupPaid.isPending} className="primary-button" style={{ opacity: markGroupPaid.isPending ? .7 : 1 }}>
                  {markGroupPaid.isPending ? 'Saving...' : 'Confirm payment'}
                </button>
              </div>
            </form>
          </div>
        )}
      </PermissionGate>
    </Layout>
  )
}
