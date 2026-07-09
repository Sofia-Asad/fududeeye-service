import { Link } from 'react-router-dom'
import { CheckCircle2, Plus, Printer, ShoppingCart } from 'lucide-react'

import type { Sale } from '@/types/sales'
import { formatDate, PAYMENT_METHOD_LABELS } from '@/lib/sales'

export default function SaleSuccessScreen({ sale }: { sale: Sale }) {
  return (
    <div className="app-page">
      <div style={{ maxWidth: 560, margin: '40px auto 0' }}>
        <div className="card no-print" style={{ padding: '36px 32px', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ display: 'grid', placeItems: 'center', width: 60, height: 60, margin: '0 auto', borderRadius: 999, background: 'var(--success-bg)', color: 'var(--success)' }}>
            <CheckCircle2 size={30} />
          </div>
          <h1 className="serif" style={{ margin: '18px 0 0', fontSize: 26, fontWeight: 700 }}>Sale completed</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: 13.5 }}>
            Sale #{sale.id} was recorded and inventory has been updated.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 24 }}>
            <button type="button" onClick={() => window.print()} className="secondary-button">
              <Printer size={16} />
              Print Receipt
            </button>
            <Link to={`/sales/${sale.id}`} className="secondary-button">
              <ShoppingCart size={16} />
              View Sale
            </Link>
            <Link to="/sales/new" className="secondary-button">
              <Plus size={16} />
              Create Another Sale
            </Link>
            <Link to="/sales" className="wizard-gold-button">
              Back to Sales
            </Link>
          </div>
        </div>

        <section className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Receipt</div>
              <h2 className="serif" style={{ margin: '3px 0 0', fontSize: 19, fontWeight: 700 }}>Fududeeye Brokerage</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Sale #{sale.id}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{formatDate(sale.sale_date)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10, borderTop: '1px solid var(--row-line)', paddingTop: 14 }}>
            {[
              ['Item', sale.item_title],
              ['Buyer', sale.buyer_name],
              ['Quantity', String(sale.quantity_sold)],
              ['Sale total', `$${sale.sale_price}`],
              ['Payment method', PAYMENT_METHOD_LABELS[sale.payment_method]],
              ['Handled by', sale.handled_by_name],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>{label}</span>
                <strong style={{ fontSize: 13 }}>{value}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
