import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Globe,
  Mail,
  MessageCircle,
  MessageCircleQuestion,
  Phone,
  PhoneCall,
  Save,
  ShoppingCart,
  Tag,
  UserCheck,
  UserPlus,
  XCircle,
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { convertInquiry, getInquiry, updateInquiry } from '@/api/inquiries'
import { useAuth } from '@/auth/AuthContext'
import DetailMeta from '@/components/DetailMeta'
import Layout from '@/components/Layout'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import { SkeletonLines } from '@/components/Skeleton'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import { errorMessage } from '@/lib/errors'
import { INQUIRY_KIND_LABELS, INQUIRY_STATUS_LABELS, INQUIRY_STATUSES } from '@/lib/inquiry'
import { formatDate } from '@/lib/service'
import { notifyError, notifySuccess } from '@/lib/toast'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { InquiryStatus, InquiryUpdatePayload } from '@/types/inquiry'

export default function InquiryDetail() {
  const { id } = useParams()
  const inquiryId = Number(id)
  const validInquiryId = Number.isFinite(inquiryId) && inquiryId > 0
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<InquiryStatus>('NEW')
  const [staffNotes, setStaffNotes] = useState('')
  const [followUpOpen, setFollowUpOpen] = useState(false)
  const [followUpDate, setFollowUpDate] = useState('')

  const inquiry = useQuery({
    queryKey: ['inquiry', inquiryId],
    queryFn: () => getInquiry(inquiryId),
    enabled: validInquiryId,
  })

  useEffect(() => {
    if (!inquiry.data) return
    setStatus(inquiry.data.status)
    setStaffNotes(inquiry.data.staff_notes)
  }, [inquiry.data])

  const save = useMutation({
    mutationFn: (payload: InquiryUpdatePayload) => updateInquiry(inquiryId, payload),
    onSuccess: updated => {
      queryClient.setQueryData(['inquiry', inquiryId], updated)
      void queryClient.invalidateQueries({ queryKey: ['inquiries'] })
      notifySuccess('Inquiry updated')
    },
    onError: (error: unknown) => notifyError(errorMessage(error)),
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    save.mutate({ status, staff_notes: staffNotes })
  }

  function assignToMe() {
    if (!user) return
    save.mutate({ handled_by: user.id, status: status === 'NEW' ? 'CONTACTED' : status })
  }

  function scheduleFollowUp() {
    if (!followUpDate) return
    const note = `Follow-up scheduled for ${formatDate(followUpDate)}.`
    const newNotes = staffNotes ? `${note}\n${staffNotes}` : note
    setStaffNotes(newNotes)
    save.mutate({ staff_notes: newNotes })
    setFollowUpOpen(false)
    setFollowUpDate('')
  }

  const convert = useMutation({
    mutationFn: () => convertInquiry(inquiryId),
    onSuccess: result => {
      void queryClient.invalidateQueries({ queryKey: ['inquiry', inquiryId] })
      void queryClient.invalidateQueries({ queryKey: ['inquiries'] })
      if (result.demand_id) {
        notifySuccess(result.customer_created ? 'Customer and demand created' : 'Demand created for existing customer')
      } else {
        notifySuccess(result.customer_created ? 'Customer created' : 'Matched to existing customer')
      }
      navigate(`/customers/${result.customer_id}`)
    },
    onError: (error: unknown) => notifyError(errorMessage(error)),
  })

  const convertForSale = useMutation({
    mutationFn: () => convertInquiry(inquiryId),
    onSuccess: result => {
      void queryClient.invalidateQueries({ queryKey: ['inquiry', inquiryId] })
      void queryClient.invalidateQueries({ queryKey: ['inquiries'] })
      notifySuccess(result.customer_created ? 'Customer created — continue in New Sale.' : 'Matched to existing customer — continue in New Sale.')
      navigate(`/sales/new?item=${inquiry.data?.item}&buyer=${result.customer_id}`)
    },
    onError: (error: unknown) => notifyError(errorMessage(error)),
  })

  if (!validInquiryId) {
    return <Layout><div className="app-page"><div className="error-banner">Inquiry not found.</div></div></Layout>
  }

  if (inquiry.isLoading) {
    return (
      <Layout>
        <div className="app-page">
          <SkeletonLines />
        </div>
      </Layout>
    )
  }

  if (inquiry.isError || !inquiry.data) {
    return <Layout><div className="app-page"><div className="error-banner">{errorMessage(inquiry.error)}</div></div></Layout>
  }

  const current = inquiry.data

  return (
    <Layout>
      <div className="app-page">
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <Link to="/inquiries" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--primary-hover)', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginBottom: 14 }}>
            <ArrowLeft size={16} />
            Inquiries
          </Link>

          <PageHeader
            eyebrow="Inquiry detail"
            title={current.full_name}
            subtitle={`${INQUIRY_KIND_LABELS[current.kind]} - received ${formatDate(current.created_at)}`}
            actions={<StatusBadge status={current.status} />}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
            <SummaryCard label="Status" value={INQUIRY_STATUS_LABELS[current.status]} caption="Current workflow state" icon={<MessageCircleQuestion size={18} />} />
            <SummaryCard label="Type" value={INQUIRY_KIND_LABELS[current.kind]} caption={current.item ? 'About a listing' : 'A requested item'} icon={<Tag size={18} />} tone="blue" />
            <SummaryCard label="Handled by" value={current.handled_by_name || 'Unassigned'} caption="Responsible staff" icon={<UserCheck size={18} />} tone={current.handled_by_name ? 'primary' : 'amber'} />
          </div>

          <div className="content-sidebar-grid">
            <DetailMeta
              title="Lead details"
              rows={[
                { label: 'Full name', value: current.full_name },
                { label: 'Phone', value: <a href={`tel:${current.phone}`} style={{ color: 'var(--primary-hover)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Phone size={13} />{current.phone}</a> },
                { label: 'Email', value: current.email ? <a href={`mailto:${current.email}`} style={{ color: 'var(--primary-hover)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Mail size={13} />{current.email}</a> : '-' },
                {
                  label: current.item ? 'Listing' : current.kind === 'ITEM_REQUEST' ? 'Item needed' : 'Type',
                  value: current.item
                    ? <Link to={`/items/${current.item}`} style={{ color: 'var(--primary-hover)' }}>{current.item_title}</Link>
                    : current.kind === 'ITEM_REQUEST' ? (current.item_needed || '-') : INQUIRY_KIND_LABELS[current.kind],
                },
                ...(current.item ? [
                  {
                    label: 'Photo',
                    value: current.item_image
                      ? <img src={current.item_image} alt={current.item_title ?? 'Item'} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
                      : '-',
                  },
                  { label: 'Category', value: current.item_category_name || '-' },
                  { label: 'Price', value: current.item_listed_price ? <MoneyDisplay value={current.item_listed_price} /> : '-' },
                  { label: 'Item status', value: current.item_status ? <StatusBadge status={current.item_status} /> : '-' },
                ] : []),
                { label: 'Message', value: current.message || '-' },
                {
                  label: 'Source',
                  value: (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'var(--info-bg)', color: 'var(--info)' }}>
                      <Globe size={11} />
                      Website
                    </span>
                  ),
                },
                { label: 'Received', value: formatDate(current.created_at) },
                { label: 'Updated', value: formatDate(current.updated_at) },
              ]}
            />

            <aside style={{ display: 'grid', gap: 16 }}>
              <section className="card" style={{ padding: 20 }}>
                <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>Quick actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <a href={`tel:${current.phone}`} className="secondary-button" style={{ justifyContent: 'center' }}>
                    <PhoneCall size={15} />
                    Call Customer
                  </a>
                  <a
                    href={buildWhatsAppUrl(current.phone, `Hi ${current.full_name}, thanks for reaching out to Fududeeye${current.item_title ? ` about "${current.item_title}"` : ''}.`)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="secondary-button"
                    style={{ justifyContent: 'center' }}
                  >
                    <MessageCircle size={15} />
                    Open WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => save.mutate({ status: 'CONTACTED' })}
                    disabled={save.isPending || current.status === 'CONTACTED'}
                    className="secondary-button"
                    style={{ justifyContent: 'center' }}
                  >
                    <CheckCircle2 size={15} />
                    Mark Contacted
                  </button>
                  <button
                    type="button"
                    onClick={() => save.mutate({ status: 'CLOSED' })}
                    disabled={save.isPending || current.status === 'CLOSED'}
                    className="secondary-button"
                    style={{ justifyContent: 'center' }}
                  >
                    <XCircle size={15} />
                    Close Inquiry
                  </button>
                </div>

                {current.item && (
                  <Link
                    to={`/items/${current.item}`}
                    className="secondary-button"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                  >
                    <Tag size={15} />
                    View Item
                  </Link>
                )}

                {followUpOpen ? (
                  <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                    <input
                      type="date"
                      className="control"
                      value={followUpDate}
                      onChange={event => setFollowUpDate(event.target.value)}
                      style={{ width: '100%', padding: '0 12px' }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" onClick={scheduleFollowUp} disabled={!followUpDate || save.isPending} className="primary-button" style={{ flex: 1, justifyContent: 'center' }}>
                        Confirm date
                      </button>
                      <button type="button" onClick={() => setFollowUpOpen(false)} className="secondary-button" style={{ flex: 1, justifyContent: 'center' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setFollowUpOpen(true)} className="secondary-button" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
                    <CalendarClock size={15} />
                    Schedule Follow-up
                  </button>
                )}
              </section>

              <section className="card" style={{ padding: 20 }}>
                <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>Workflow</h2>
                <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
                  <label className="field-label">
                    <span className="field-title">Status</span>
                    <select className="control" value={status} onChange={event => setStatus(event.target.value as InquiryStatus)}>
                      {INQUIRY_STATUSES.map(nextStatus => (
                        <option key={nextStatus} value={nextStatus}>{INQUIRY_STATUS_LABELS[nextStatus]}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field-label">
                    <span className="field-title">Staff notes</span>
                    <textarea className="control" value={staffNotes} onChange={event => setStaffNotes(event.target.value)} rows={6} placeholder="Internal notes about this lead…" />
                  </label>
                  {save.isError && <div className="error-banner">{errorMessage(save.error)}</div>}
                  <button type="submit" disabled={save.isPending} className="primary-button" style={{ opacity: save.isPending ? .7 : 1 }}>
                    <Save size={16} />
                    {save.isPending ? 'Saving...' : 'Save workflow'}
                  </button>
                  <button
                    type="button"
                    onClick={assignToMe}
                    disabled={save.isPending || current.handled_by === user?.id}
                    className="secondary-button"
                  >
                    <UserCheck size={16} />
                    {current.handled_by === user?.id ? 'Assigned to you' : 'Assign to me'}
                  </button>
                </form>
              </section>

              <section className="card" style={{ padding: 20 }}>
                <h2 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>Convert lead</h2>
                <p style={{ margin: '0 0 14px', color: 'var(--muted)', fontSize: 12.5 }}>
                  {current.kind === 'ITEM_REQUEST'
                    ? 'Creates a Customer record (reusing one with a matching phone) and a Demand for what they need.'
                    : 'Creates a Customer record, reusing one with a matching phone if it already exists.'}
                </p>
                {convert.isError && <div className="error-banner" style={{ marginBottom: 12 }}>{errorMessage(convert.error)}</div>}
                <button
                  type="button"
                  onClick={() => convert.mutate()}
                  disabled={convert.isPending}
                  className="primary-button"
                  style={{ width: '100%', opacity: convert.isPending ? .7 : 1 }}
                >
                  <UserPlus size={16} />
                  {convert.isPending ? 'Converting...' : 'Convert to Customer'}
                </button>

                {current.item && (
                  <>
                    <p style={{ margin: '12px 0 10px', color: 'var(--muted)', fontSize: 12.5 }}>
                      Already talked to them? Jump straight into recording the sale for this listing.
                    </p>
                    {convertForSale.isError && <div className="error-banner" style={{ marginBottom: 12 }}>{errorMessage(convertForSale.error)}</div>}
                    <button
                      type="button"
                      onClick={() => convertForSale.mutate()}
                      disabled={convertForSale.isPending}
                      className="wizard-gold-button"
                      style={{ width: '100%', opacity: convertForSale.isPending ? .7 : 1 }}
                    >
                      <ShoppingCart size={16} />
                      {convertForSale.isPending ? 'Preparing...' : 'Convert to Sale'}
                    </button>
                  </>
                )}
              </section>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  )
}
