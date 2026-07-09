import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CreditCard, FileText, ReceiptText, Save, Tags } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { getExpense, getExpenseHistory, listExpenseCategories, updateExpense } from '@/api/finance'
import ActivityFeed, { type ActivityFeedItem } from '@/components/ActivityFeed'
import DetailMeta from '@/components/DetailMeta'
import { Field } from '@/components/FormSection'
import Layout from '@/components/Layout'
import { SkeletonLines } from '@/components/Skeleton'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import PermissionGate from '@/components/PermissionGate'
import SummaryCard from '@/components/SummaryCard'
import { changeLabel, formatDateTime } from '@/lib/auditLog'
import { errorMessage } from '@/lib/errors'
import { notifyError, notifySuccess } from '@/lib/toast'
import { fieldErrors, useFocusFirstError } from '@/lib/validation'
import { formatDate, PAYMENT_METHOD_LABELS, PAYMENT_METHODS } from '@/lib/sales'
import type { AuditLogRow } from '@/types/reports'
import type { PaymentMethod } from '@/types/sales'

const moneyPattern = /^\d+(\.\d{1,2})?$/
const expenseEditSchema = z.object({
  category: z.string().trim().min(1, 'Please choose a category.'),
  amount: z.string().trim().regex(moneyPattern, 'Enter a valid amount.'),
  expense_date: z.string().trim().min(1, 'Date is required.'),
  payment_method: z.enum(['CASH', 'EVC_PLUS', 'ZAAD', 'SAHAL', 'BANK_TRANSFER', 'OTHER']),
  description: z.string().trim().min(1, 'Please enter an expense description.'),
  notes: z.string().trim(),
}).refine(value => Number(value.amount) > 0, {
  path: ['amount'],
  message: 'Amount must be greater than zero.',
})

type ExpenseEditForm = z.infer<typeof expenseEditSchema>

const EXPENSE_FIELD_LABELS: Record<string, string> = {
  category: 'Category',
  amount: 'Amount',
  expense_date: 'Expense date',
  payment_method: 'Payment method',
  description: 'Description',
  notes: 'Notes',
}

function historyItems(logs: AuditLogRow[]): ActivityFeedItem[] {
  return logs.map(log => {
    const fields = Object.keys(log.changes)
    const caption = fields.length
      ? fields.map(field => changeLabel(field, log.changes[field], EXPENSE_FIELD_LABELS)).join(' - ')
      : log.object_repr
    return {
      title: `${log.action === 'CREATE' ? 'Expense created' : log.action === 'UPDATE' ? 'Expense updated' : log.action.toLowerCase()} - ${formatDateTime(log.timestamp)}`,
      caption: `${caption}${log.user ? ` - by ${log.user}` : ''}`,
      icon: <ReceiptText size={15} />,
      tone: log.action === 'CREATE' ? 'primary' : 'blue',
    }
  })
}

export default function ExpenseDetail() {
  const { id } = useParams()
  const expenseId = Number(id)
  const validExpenseId = Number.isFinite(expenseId) && expenseId > 0
  const queryClient = useQueryClient()
  const formRef = useRef<HTMLFormElement>(null)
  const [form, setForm] = useState<ExpenseEditForm | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useFocusFirstError(errors, formRef)

  const expense = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: () => getExpense(expenseId),
    enabled: validExpenseId,
  })

  const categories = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => listExpenseCategories({ is_active: true, ordering: 'name' }),
  })

  const history = useQuery({
    queryKey: ['expense-history', expenseId],
    queryFn: () => getExpenseHistory(expenseId),
    enabled: validExpenseId,
  })

  useEffect(() => {
    if (!expense.data) return
    setForm({
      category: String(expense.data.category),
      amount: expense.data.amount,
      expense_date: expense.data.expense_date,
      payment_method: expense.data.payment_method,
      description: expense.data.description,
      notes: expense.data.notes,
    })
  }, [expense.data])

  const save = useMutation({
    mutationFn: (payload: ExpenseEditForm) => updateExpense(expenseId, {
      category: Number(payload.category),
      amount: payload.amount,
      expense_date: payload.expense_date,
      payment_method: payload.payment_method,
      description: payload.description,
      notes: payload.notes,
    }),
    onSuccess: updated => {
      queryClient.setQueryData(['expense', expenseId], updated)
      void queryClient.invalidateQueries({ queryKey: ['expenses'] })
      void queryClient.invalidateQueries({ queryKey: ['expense-history', expenseId] })
      notifySuccess('Expense saved')
    },
    onError: error => notifyError(errorMessage(error)),
  })

  function updateField<K extends keyof ExpenseEditForm>(field: K, value: ExpenseEditForm[K]) {
    setForm(current => current && { ...current, [field]: value })
    setErrors(current => ({ ...current, [field]: '' }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form) return
    const parsed = expenseEditSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    save.mutate(parsed.data)
  }

  if (!validExpenseId) {
    return <Layout><div className="app-page"><div className="error-banner">Expense not found.</div></div></Layout>
  }

  return (
    <Layout>
      <PermissionGate minRole="MANAGER" fallback={
        <div className="app-page">
          <div className="card" style={{ padding: 22, color: 'var(--muted)' }}>Your role cannot view expenses.</div>
        </div>
      }>
        <div className="app-page">
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            <Link to="/expenses" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--primary-hover)', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginBottom: 14 }}>
              <ArrowLeft size={16} />
              Expenses
            </Link>

            {expense.isLoading && <SkeletonLines widths={['30%', '60%']} />}
            {expense.isError && <div className="error-banner">{errorMessage(expense.error)}</div>}

            {expense.data && form && (
              <>
                <PageHeader
                  eyebrow="Expense detail"
                  title={expense.data.description}
                  subtitle={`${expense.data.category_name || 'Uncategorized'} - recorded ${formatDate(expense.data.expense_date)}`}
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
                  <SummaryCard label="Amount" value={<MoneyDisplay value={expense.data.amount} />} caption="Recorded cost" icon={<CreditCard size={18} />} tone="red" valueColor="var(--money-owed)" />
                  <SummaryCard label="Category" value={expense.data.category_name || '-'} caption="Expense grouping" icon={<Tags size={18} />} tone="amber" />
                  <SummaryCard label="Payment method" value={PAYMENT_METHOD_LABELS[expense.data.payment_method]} caption="How it was paid" icon={<CreditCard size={18} />} tone="blue" />
                  <SummaryCard label="Date" value={formatDate(expense.data.expense_date)} caption="Expense date" icon={<FileText size={18} />} tone="neutral" />
                </div>

                <div className="content-sidebar-grid">
                  <DetailMeta
                    title="Expense details"
                    rows={[
                      { label: 'Description', value: expense.data.description },
                      { label: 'Category', value: expense.data.category_name || '-' },
                      { label: 'Amount', value: <MoneyDisplay value={expense.data.amount} /> },
                      { label: 'Payment method', value: PAYMENT_METHOD_LABELS[expense.data.payment_method] },
                      { label: 'Notes', value: expense.data.notes || '-' },
                      { label: 'Created', value: formatDateTime(expense.data.created_at) },
                      { label: 'Last updated', value: formatDateTime(expense.data.updated_at) },
                    ]}
                  />

                  <aside style={{ display: 'grid', gap: 16 }}>
                    <section className="card" style={{ padding: 20 }}>
                      <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>Edit expense</h2>
                      <form ref={formRef} onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
                        <Field label="Category" error={errors.category} name="category">
                          <select className="control" value={form.category} onChange={event => updateField('category', event.target.value)}>
                            <option value="">Choose category</option>
                            {(categories.data?.results ?? []).map(row => (
                              <option key={row.id} value={row.id}>{row.name}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Amount" error={errors.amount} name="amount">
                          <input className="control" value={form.amount} onChange={event => updateField('amount', event.target.value)} inputMode="decimal" />
                        </Field>
                        <Field label="Date" error={errors.expense_date} name="expense_date">
                          <input className="control" type="date" value={form.expense_date} onChange={event => updateField('expense_date', event.target.value)} />
                        </Field>
                        <Field label="Payment method" name="payment_method">
                          <select className="control" value={form.payment_method} onChange={event => updateField('payment_method', event.target.value as PaymentMethod)}>
                            {PAYMENT_METHODS.map(method => (
                              <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method]}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Description" error={errors.description} name="description">
                          <textarea className="control" value={form.description} onChange={event => updateField('description', event.target.value)} rows={3} />
                        </Field>
                        <Field label="Notes" name="notes">
                          <textarea className="control" value={form.notes} onChange={event => updateField('notes', event.target.value)} rows={3} />
                        </Field>
                        <button type="submit" disabled={save.isPending} className="primary-button" style={{ opacity: save.isPending ? .7 : 1 }}>
                          <Save size={16} />
                          {save.isPending ? 'Saving...' : 'Save expense'}
                        </button>
                      </form>
                    </section>

                    {history.isLoading && <SkeletonLines widths={['50%', '70%']} />}
                    {history.data && <ActivityFeed title="History" items={historyItems(history.data)} />}
                  </aside>
                </div>
              </>
            )}
          </div>
        </div>
      </PermissionGate>
    </Layout>
  )
}
