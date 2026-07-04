import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { CreditCard, Filter, FolderPlus, Plus, ReceiptText, RotateCcw, Tags, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { createExpense, createExpenseCategory, listExpenseCategories, listExpenses } from '@/api/finance'
import { getExpenseReport } from '@/api/reports'
import { useAuth } from '@/auth/AuthContext'
import DataTable, { type Column } from '@/components/DataTable'
import DirectoryCard, { DirectorySelect, DirectorySkeleton, DirectoryToolbar, SearchBox } from '@/components/DirectoryCard'
import EmptyState from '@/components/EmptyState'
import { Field } from '@/components/FormSection'
import Layout from '@/components/Layout'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import PaginationFooter from '@/components/PaginationFooter'
import PermissionGate from '@/components/PermissionGate'
import SummaryCard from '@/components/SummaryCard'
import { errorMessage } from '@/lib/errors'
import { formatDate, PAYMENT_METHOD_LABELS, PAYMENT_METHODS, todayISO } from '@/lib/sales'
import { notifyError, notifySuccess } from '@/lib/toast'
import { useEscapeToClose } from '@/lib/useEscapeToClose'
import { fieldErrors, useFocusFirstError } from '@/lib/validation'
import type { Expense } from '@/types/finance'
import type { PaymentMethod } from '@/types/sales'

type PaymentFilter = 'all' | PaymentMethod

const moneyPattern = /^\d+(\.\d{1,2})?$/
const expenseSchema = z.object({
  category: z.string().trim().min(1, 'Category is required.'),
  amount: z.string().trim().regex(moneyPattern, 'Use a valid amount.'),
  expense_date: z.string().trim().min(1, 'Date is required.'),
  payment_method: z.enum(['CASH', 'EVC_PLUS', 'ZAAD', 'BANK_TRANSFER', 'OTHER']),
  description: z.string().trim().min(1, 'Description is required.'),
  notes: z.string().trim(),
}).refine(value => Number(value.amount) > 0, {
  path: ['amount'],
  message: 'Amount must be greater than zero.',
})

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  description: z.string().trim(),
})

type ExpenseForm = z.infer<typeof expenseSchema>
type CategoryForm = z.infer<typeof categorySchema>

const emptyExpenseForm: ExpenseForm = {
  category: '',
  amount: '',
  expense_date: todayISO(),
  payment_method: 'CASH',
  description: '',
  notes: '',
}

const emptyCategoryForm: CategoryForm = {
  name: '',
  description: '',
}

function monthStartISO() {
  const date = new Date()
  date.setDate(1)
  return date.toISOString().slice(0, 10)
}

export default function Expenses() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const expenseFormRef = useRef<HTMLFormElement>(null)
  const categoryFormRef = useRef<HTMLFormElement>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentFilter>('all')
  const [startDate, setStartDate] = useState(monthStartISO())
  const [endDate, setEndDate] = useState(todayISO())
  const [currentPage, setCurrentPage] = useState(1)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>(emptyExpenseForm)
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm)
  const [expenseErrors, setExpenseErrors] = useState<Record<string, string>>({})
  const [categoryErrors, setCategoryErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setCurrentPage(1)
  }, [search, category, paymentMethod, startDate, endDate])

  useFocusFirstError(expenseErrors, expenseFormRef)
  useFocusFirstError(categoryErrors, categoryFormRef)
  useEscapeToClose(expenseModalOpen, () => setExpenseModalOpen(false))
  useEscapeToClose(categoryModalOpen, () => setCategoryModalOpen(false))

  const enabled = !!user?.can_view_finance

  const categories = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => listExpenseCategories({ is_active: true, ordering: 'name' }),
    enabled,
  })

  const expenses = useQuery({
    queryKey: ['expenses', search, category, paymentMethod, startDate, endDate, currentPage],
    queryFn: () => listExpenses({
      search: search.trim() || undefined,
      category: category ?? undefined,
      payment_method: paymentMethod === 'all' ? undefined : paymentMethod,
      start: startDate || undefined,
      end: endDate || undefined,
      ordering: '-expense_date',
      page: currentPage,
    }),
    enabled,
  })

  const expenseReport = useQuery({
    queryKey: ['reports', 'expenses', category, startDate, endDate],
    queryFn: () => getExpenseReport({
      category: category ?? undefined,
      start: startDate || undefined,
      end: endDate || undefined,
    }),
    enabled,
  })

  const create = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      setExpenseModalOpen(false)
      setExpenseForm({ ...emptyExpenseForm, expense_date: todayISO() })
      setExpenseErrors({})
      void queryClient.invalidateQueries({ queryKey: ['expenses'] })
      void queryClient.invalidateQueries({ queryKey: ['reports'] })
      notifySuccess('Expense saved')
    },
    onError: error => notifyError(errorMessage(error)),
  })

  const createCategory = useMutation({
    mutationFn: createExpenseCategory,
    onSuccess: categoryRow => {
      setCategoryModalOpen(false)
      setCategoryForm(emptyCategoryForm)
      setCategoryErrors({})
      setExpenseForm(current => ({ ...current, category: String(categoryRow.id) }))
      void queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
      notifySuccess('Category saved')
    },
    onError: error => notifyError(errorMessage(error)),
  })

  const rows = expenses.data?.results ?? []
  const largestCategory = useMemo(() => expenseReport.data?.by_category.reduce<null | { category: string; total: string }>((largest, row) => {
    if (!largest || Number(row.total) > Number(largest.total)) {
      return { category: row.category, total: row.total }
    }
    return largest
  }, null), [expenseReport.data?.by_category])

  const cashRows = rows.filter(row => row.payment_method === 'CASH').length

  const columns: Column<Expense>[] = [
    {
      key: 'expense_date',
      header: 'Expense',
      render: expense => (
        <Link to={`/expenses/${expense.id}`} style={{ display: 'flex', alignItems: 'center', gap: 11, color: 'inherit', textDecoration: 'none' }}>
          <span style={{ width: 38, height: 38, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <ReceiptText size={16} />
          </span>
          <span>
            <strong style={{ display: 'block', color: 'var(--text)', fontWeight: 700 }}>{expense.description}</strong>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{formatDate(expense.expense_date)}</span>
          </span>
        </Link>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: expense => (
        <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'var(--neutral-bg)', color: 'var(--neutral)' }}>
          {expense.category_name || '-'}
        </span>
      ),
    },
    { key: 'payment_method', header: 'Paid via', render: expense => PAYMENT_METHOD_LABELS[expense.payment_method] },
    { key: 'notes', header: 'Notes', render: expense => expense.notes || '-' },
    { key: 'amount', header: 'Amount', align: 'right', render: expense => <MoneyDisplay value={expense.amount} /> },
  ]

  function updateExpenseField<K extends keyof ExpenseForm>(field: K, value: ExpenseForm[K]) {
    setExpenseForm(current => ({ ...current, [field]: value }))
    setExpenseErrors(current => ({ ...current, [field]: '' }))
  }

  function updateCategoryField<K extends keyof CategoryForm>(field: K, value: CategoryForm[K]) {
    setCategoryForm(current => ({ ...current, [field]: value }))
    setCategoryErrors(current => ({ ...current, [field]: '' }))
  }

  function submitExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = expenseSchema.safeParse(expenseForm)
    if (!parsed.success) {
      setExpenseErrors(fieldErrors(parsed.error))
      return
    }
    create.mutate({
      category: Number(parsed.data.category),
      amount: parsed.data.amount,
      expense_date: parsed.data.expense_date,
      payment_method: parsed.data.payment_method,
      description: parsed.data.description,
      notes: parsed.data.notes,
    })
  }

  function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = categorySchema.safeParse(categoryForm)
    if (!parsed.success) {
      setCategoryErrors(fieldErrors(parsed.error))
      return
    }
    createCategory.mutate({
      name: parsed.data.name,
      description: parsed.data.description,
      is_active: true,
    })
  }

  function resetFilters() {
    setSearch('')
    setCategory(null)
    setPaymentMethod('all')
    setStartDate(monthStartISO())
    setEndDate(todayISO())
  }

  return (
    <Layout>
      <PermissionGate minRole="MANAGER" fallback={
        <div className="app-page">
          <div className="card" style={{ padding: 22, color: 'var(--muted)' }}>Your role cannot view expenses.</div>
        </div>
      }>
        <div className="app-page">
          <PageHeader
            eyebrow="Money"
            title="Expenses"
            subtitle="Operating costs by category, date range, and payment method."
            actions={(
              <>
                <button type="button" onClick={() => setCategoryModalOpen(true)} className="secondary-button">
                  <FolderPlus size={16} />
                  Category
                </button>
                <button type="button" onClick={() => setExpenseModalOpen(true)} className="primary-button">
                  <Plus size={16} />
                  New expense
                </button>
              </>
            )}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
            <SummaryCard label="Total expenses" value={<MoneyDisplay value={expenseReport.data?.total ?? 0} />} caption="Selected period" icon={<CreditCard size={18} />} tone="red" valueColor="var(--money-owed)" />
            <SummaryCard label="Largest category" value={largestCategory ? largestCategory.category : '-'} caption={largestCategory ? <MoneyDisplay value={largestCategory.total} /> : 'No spend yet'} icon={<Tags size={18} />} tone="amber" />
            <SummaryCard label="Rows in period" value={expenseReport.data?.count ?? '-'} caption="Report count" icon={<ReceiptText size={18} />} tone="blue" />
            <SummaryCard label="Cash rows" value={cashRows} caption="On current page" icon={<CreditCard size={18} />} tone="neutral" />
          </div>

          <DirectoryCard
            title="Expense directory"
            count={expenses.data ? `${expenses.data.count} expenses in view` : 'Loading records'}
            toolbar={(
              <DirectoryToolbar>
                <SearchBox value={search} onChange={setSearch} placeholder="Search expenses" />
                <input className="control" type="date" value={startDate} onChange={event => setStartDate(event.target.value)} style={{ padding: '0 12px' }} />
                <input className="control" type="date" value={endDate} onChange={event => setEndDate(event.target.value)} style={{ padding: '0 12px' }} />
                <DirectorySelect value={category ?? 'all'} onChange={value => setCategory(value === 'all' ? null : Number(value))} ariaLabel="Expense category">
                  <option value="all">All categories</option>
                  {(categories.data?.results ?? []).map(row => (
                    <option key={row.id} value={row.id}>{row.name}</option>
                  ))}
                </DirectorySelect>
                <DirectorySelect value={paymentMethod} onChange={value => setPaymentMethod(value as PaymentFilter)} ariaLabel="Payment method">
                  <option value="all">All payments</option>
                  {PAYMENT_METHODS.map(method => (
                    <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method]}</option>
                  ))}
                </DirectorySelect>
                <button type="button" className="primary-button" onClick={() => setCurrentPage(1)}>
                  <Filter size={16} />
                  Filter
                </button>
                <button type="button" className="secondary-button" onClick={resetFilters}>
                  <RotateCcw size={16} />
                  Reset
                </button>
              </DirectoryToolbar>
            )}
            footer={expenses.data && (
              <PaginationFooter
                page={currentPage}
                total={expenses.data.count}
                hasPrevious={!!expenses.data.previous}
                hasNext={!!expenses.data.next}
                onPrevious={() => setCurrentPage(page => Math.max(1, page - 1))}
                onNext={() => setCurrentPage(page => page + 1)}
              />
            )}
          >
            {expenses.isLoading && <DirectorySkeleton />}
            {expenses.isError && <div className="error-banner" style={{ margin: '0 18px 18px' }}>{errorMessage(expenses.error)}</div>}
            {expenses.data && (
              <DataTable
                columns={columns}
                rows={rows}
                variant="bare"
                empty={(
                  <EmptyState
                    icon={<ReceiptText size={18} />}
                    title="No expenses found."
                    subtitle="Record your first operating cost to start tracking spend."
                    action={<button type="button" onClick={() => setExpenseModalOpen(true)} className="primary-button"><Plus size={16} />New expense</button>}
                  />
                )}
              />
            )}
          </DirectoryCard>
        </div>
      </PermissionGate>

      {expenseModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center', background: 'rgba(34,48,42,.34)', padding: 20 }} onClick={() => setExpenseModalOpen(false)}>
          <form ref={expenseFormRef} onSubmit={submitExpense} className="card" style={{ width: 'min(560px, 100%)', maxHeight: '88vh', overflow: 'auto' }} onClick={event => event.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '20px 22px', borderBottom: '1px solid var(--row-line)' }}>
              <div>
                <h2 className="serif" style={{ margin: 0, fontSize: 25, lineHeight: 1.1 }}>New expense</h2>
                <p style={{ margin: '5px 0 0', color: 'var(--muted)', fontSize: 13 }}>Record an operating cost.</p>
              </div>
              <button type="button" onClick={() => setExpenseModalOpen(false)} className="secondary-button" style={{ width: 38, padding: 0 }} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: 22, display: 'grid', gap: 16 }}>
              <Field label="Category" error={expenseErrors.category} name="category">
                <select autoFocus className="control" value={expenseForm.category} onChange={event => updateExpenseField('category', event.target.value)} style={{ width: '100%', padding: '0 12px' }}>
                  <option value="">Choose category</option>
                  {(categories.data?.results ?? []).map(row => (
                    <option key={row.id} value={row.id}>{row.name}</option>
                  ))}
                </select>
              </Field>
              <div className="modal-grid-3" style={{ gap: 14 }}>
                <Field label="Amount" error={expenseErrors.amount} name="amount">
                  <input className="control" value={expenseForm.amount} onChange={event => updateExpenseField('amount', event.target.value)} inputMode="decimal" style={{ width: '100%', padding: '0 12px' }} />
                </Field>
                <Field label="Date" error={expenseErrors.expense_date} name="expense_date">
                  <input className="control" type="date" value={expenseForm.expense_date} onChange={event => updateExpenseField('expense_date', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
                </Field>
                <Field label="Payment" name="payment_method">
                  <select className="control" value={expenseForm.payment_method} onChange={event => updateExpenseField('payment_method', event.target.value as PaymentMethod)} style={{ width: '100%', padding: '0 12px' }}>
                    {PAYMENT_METHODS.map(method => (
                      <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method]}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Description" error={expenseErrors.description} name="description">
                <textarea className="control" value={expenseForm.description} onChange={event => updateExpenseField('description', event.target.value)} rows={3} style={{ width: '100%', height: 'auto', padding: 12, resize: 'vertical' }} />
              </Field>
              <Field label="Notes" name="notes">
                <textarea className="control" value={expenseForm.notes} onChange={event => updateExpenseField('notes', event.target.value)} rows={3} style={{ width: '100%', height: 'auto', padding: 12, resize: 'vertical' }} />
              </Field>
              {create.isError && <div className="error-banner">{errorMessage(create.error)}</div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 22px', borderTop: '1px solid var(--row-line)' }}>
              <button type="button" onClick={() => setExpenseModalOpen(false)} className="secondary-button">Cancel</button>
              <button type="submit" disabled={create.isPending} className="primary-button" style={{ opacity: create.isPending ? .7 : 1 }}>
                {create.isPending ? 'Saving...' : 'Save expense'}
              </button>
            </div>
          </form>
        </div>
      )}

      {categoryModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center', background: 'rgba(34,48,42,.34)', padding: 20 }} onClick={() => setCategoryModalOpen(false)}>
          <form ref={categoryFormRef} onSubmit={submitCategory} className="card" style={{ width: 'min(440px, 100%)', overflow: 'hidden' }} onClick={event => event.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '20px 22px', borderBottom: '1px solid var(--row-line)' }}>
              <div>
                <h2 className="serif" style={{ margin: 0, fontSize: 25, lineHeight: 1.1 }}>New category</h2>
                <p style={{ margin: '5px 0 0', color: 'var(--muted)', fontSize: 13 }}>Organize expense reporting.</p>
              </div>
              <button type="button" onClick={() => setCategoryModalOpen(false)} className="secondary-button" style={{ width: 38, padding: 0 }} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: 22, display: 'grid', gap: 16 }}>
              <Field label="Name" error={categoryErrors.name} name="name">
                <input autoFocus className="control" value={categoryForm.name} onChange={event => updateCategoryField('name', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
              </Field>
              <Field label="Description" name="description">
                <textarea className="control" value={categoryForm.description} onChange={event => updateCategoryField('description', event.target.value)} rows={3} style={{ width: '100%', height: 'auto', padding: 12, resize: 'vertical' }} />
              </Field>
              {createCategory.isError && <div className="error-banner">{errorMessage(createCategory.error)}</div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 22px', borderTop: '1px solid var(--row-line)' }}>
              <button type="button" onClick={() => setCategoryModalOpen(false)} className="secondary-button">Cancel</button>
              <button type="submit" disabled={createCategory.isPending} className="primary-button" style={{ opacity: createCategory.isPending ? .7 : 1 }}>
                {createCategory.isPending ? 'Saving...' : 'Save category'}
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  )
}
