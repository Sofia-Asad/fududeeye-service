import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Banknote, CheckCircle2, CreditCard, HandCoins, ShoppingCart, UserRound } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getSale, markSalePaid } from '@/api/sales'
import { useAuth } from '@/auth/AuthContext'
import ActivityFeed from '@/components/ActivityFeed'
import DetailMeta from '@/components/DetailMeta'
import Layout from '@/components/Layout'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import PermissionGate from '@/components/PermissionGate'
import { SkeletonLines } from '@/components/Skeleton'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import { errorMessage } from '@/lib/errors'
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS, formatDate, todayISO } from '@/lib/sales'
import { notifyError, notifySuccess } from '@/lib/toast'
import type { PaymentMethod } from '@/types/sales'

export default function SaleDetail() {
  const { id } = useParams()
  const saleId = Number(id)
  const validSaleId = Number.isFinite(saleId) && saleId > 0
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [payoutMethod, setPayoutMethod] = useState<PaymentMethod>('CASH')
  const [payoutDate, setPayoutDate] = useState(todayISO())

  const sale = useQuery({
    queryKey: ['sale', saleId],
    queryFn: () => getSale(saleId),
    enabled: validSaleId,
  })

  const markPaid = useMutation({
    mutationFn: () => markSalePaid(saleId, {
      payout_method: payoutMethod,
      payout_date: payoutDate,
      payout_handled_by: user?.id ?? 0,
    }),
    onSuccess: updatedSale => {
      queryClient.setQueryData(['sale', saleId], updatedSale)
      void queryClient.invalidateQueries({ queryKey: ['sales'] })
      void queryClient.invalidateQueries({ queryKey: ['pending-payouts'] })
      notifySuccess('Payout completed')
    },
    onError: error => notifyError(errorMessage(error)),
  })

  function submitPayout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (user) markPaid.mutate()
  }

  if (!validSaleId) {
    return (
      <Layout>
        <div className="app-page">
          <div className="error-banner">Sale not found.</div>
        </div>
      </Layout>
    )
  }

  if (sale.isLoading) {
    return (
      <Layout>
        <div className="app-page">
          <SkeletonLines widths={['42%', '72%']} />
        </div>
      </Layout>
    )
  }

  if (sale.isError || !sale.data) {
    return (
      <Layout>
        <div className="app-page">
          <div className="error-banner">{errorMessage(sale.error)}</div>
        </div>
      </Layout>
    )
  }

  const current = sale.data

  return (
    <Layout>
      <div className="app-page">
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <Link to="/sales" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--primary-hover)', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginBottom: 14 }}>
            <ArrowLeft size={16} />
            Sales
          </Link>

          <PageHeader
            eyebrow="Manage"
            title={(
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                Sale #{current.id} · {current.item_title}
                <StatusBadge status={current.payout_status} />
              </span>
            )}
            subtitle={`Sold to ${current.buyer_name} on ${formatDate(current.sale_date)}`}
            actions={(
              <>
              <button type="button" className="secondary-button">Receipt</button>
              {current.payout_status === 'PENDING' && user?.can_view_finance && (
                <a href="#payout" className="secondary-button">Pay owner</a>
              )}
              </>
            )}
          />

          <div className="form-grid" style={{ gridTemplateColumns: user?.can_view_finance ? 'repeat(4, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))', marginBottom: 16 }}>
            <SummaryCard label="Sale price" value={<MoneyDisplay value={current.sale_price} />} caption={`${current.quantity_sold} item sold`} icon={<Banknote size={18} />} />
            <SummaryCard label="Payment" value={PAYMENT_METHOD_LABELS[current.payment_method]} caption="Buyer payment method" icon={<CreditCard size={18} />} tone="blue" />
            {user?.can_view_finance && (
              <>
                <SummaryCard label="Owner payout" value={<MoneyDisplay value={current.owner_payout_amount} />} caption={current.payout_status === 'PENDING' ? 'Awaiting payment' : 'Settled'} icon={<HandCoins size={18} />} tone="red" valueColor={current.payout_status === 'PENDING' ? 'var(--money-owed)' : 'var(--text)'} />
                <SummaryCard label="Company profit" value={<MoneyDisplay value={current.company_profit} />} caption="Fududeeye markup" icon={<ShoppingCart size={18} />} tone="primary" valueColor="var(--success)" />
              </>
            )}
          </div>

          <div className="content-sidebar-grid">
            <div style={{ display: 'grid', gap: 16 }}>
              <DetailMeta
                title="Sale details"
                rows={[
                  { label: 'Item', value: <Link to={`/items/${current.item}`} style={{ color: 'var(--primary-hover)' }}>{current.item_title}</Link> },
                  { label: 'Buyer', value: <Link to={`/customers/${current.buyer}`} style={{ color: 'var(--primary-hover)' }}>{current.buyer_name}</Link> },
                  { label: 'Handled by', value: current.handled_by_name },
                  { label: 'Recorded', value: formatDate(current.created_at) },
                  { label: 'Owner type', value: current.item_owner_type.toLowerCase() },
                  { label: 'Owner', value: current.item_owner_name || 'Company' },
                  { label: 'Notes', value: current.notes || '-' },
                ]}
              />

              <section className="card" style={{ padding: 20 }}>
                <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Related records</h2>
                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    ['Item', current.item_title, `/items/${current.item}`, current.sale_price],
                    ['Buyer', current.buyer_name, `/customers/${current.buyer}`, current.sale_price],
                    ['Payout', current.payout_status, '#payout', current.owner_payout_amount],
                  ].map(([label, title, to, amount]) => (
                    <div key={label} style={{ display: 'grid', gridTemplateColumns: '90px minmax(0, 1fr) auto', gap: 12, alignItems: 'center', borderTop: '1px solid var(--row-line)', paddingTop: 12 }}>
                      <span style={{ color: 'var(--muted)', fontSize: 12.5 }}>{label}</span>
                      <Link to={String(to)} style={{ color: 'var(--primary-hover)', fontWeight: 700, textDecoration: 'none' }}>{title}</Link>
                      <span style={{ textAlign: 'right' }}><MoneyDisplay value={amount as string} /></span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside style={{ display: 'grid', gap: 16 }}>
              <ActivityFeed
                items={[
                  { title: 'Sale recorded', caption: `${formatDate(current.created_at)} by ${current.handled_by_name}`, icon: <ShoppingCart size={15} /> },
                  { title: current.payout_status === 'PAID' ? 'Owner payout paid' : 'Owner payout pending', caption: current.payout_date ? formatDate(current.payout_date) : 'Waiting for Manager/Admin action', icon: <HandCoins size={15} />, tone: current.payout_status === 'PAID' ? 'primary' : 'red' },
                  { title: 'Buyer linked', caption: current.buyer_name, icon: <UserRound size={15} />, tone: 'blue' },
                ]}
              />

              <section id="payout" className="card" style={{ padding: 20 }}>
                <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>Payout</h2>
                {current.payout_status === 'NA' && (
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>Company item. No owner payout is required.</p>
                )}
                {current.payout_status === 'PAID' && (
                  <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
                    <StatusBadge status="PAID" />
                    <div>Method: <strong>{current.payout_method ? PAYMENT_METHOD_LABELS[current.payout_method] : '-'}</strong></div>
                    <div>Date: <strong>{current.payout_date ? formatDate(current.payout_date) : '-'}</strong></div>
                    <div>Handled by: <strong>{current.payout_handled_by_name || '-'}</strong></div>
                  </div>
                )}
                {current.payout_status === 'PENDING' && (
                  <PermissionGate minRole="MANAGER" fallback={
                    <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>Pending payout. Manager or Admin can mark this paid.</p>
                  }>
                    <form onSubmit={submitPayout} style={{ display: 'grid', gap: 12 }}>
                      <div style={{ color: 'var(--money-owed)', fontWeight: 700 }}>
                        Owed: <MoneyDisplay value={current.owner_payout_amount} />
                      </div>
                      <label className="field-label">
                        <span className="field-title">Payment method</span>
                        <select className="control" value={payoutMethod} onChange={event => setPayoutMethod(event.target.value as PaymentMethod)} style={{ width: '100%', padding: '0 12px' }}>
                          {PAYMENT_METHODS.map(method => (
                            <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method]}</option>
                          ))}
                        </select>
                      </label>
                      <label className="field-label">
                        <span className="field-title">Payment date</span>
                        <input className="control" type="date" value={payoutDate} onChange={event => setPayoutDate(event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
                      </label>
                      {markPaid.isError && <div className="error-banner">{errorMessage(markPaid.error)}</div>}
                      <button type="submit" disabled={markPaid.isPending} className="primary-button" style={{ opacity: markPaid.isPending ? .7 : 1 }}>
                        <CheckCircle2 size={16} />
                        {markPaid.isPending ? 'Saving...' : 'Mark paid'}
                      </button>
                    </form>
                  </PermissionGate>
                )}
              </section>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  )
}
