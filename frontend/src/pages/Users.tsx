import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Filter, IdCard, KeyRound, Plus, ShieldCheck, UserCog, UsersRound } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { createUser, listUsers } from '@/api/accounts'
import { useAuth } from '@/auth/AuthContext'
import DataTable, { type Column } from '@/components/DataTable'
import DirectoryCard, { DirectorySelect, DirectorySkeleton, DirectoryToolbar, SearchBox } from '@/components/DirectoryCard'
import EmptyState from '@/components/EmptyState'
import { Field, FormGrid, SegmentedControl } from '@/components/FormSection'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import PageHeader from '@/components/PageHeader'
import PaginationFooter from '@/components/PaginationFooter'
import PermissionGate from '@/components/PermissionGate'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import AccordionCard from '@/components/wizard/AccordionCard'
import { formErrorMessage, errorMessage } from '@/lib/errors'
import { initials } from '@/lib/sales'
import { notifyError, notifySuccess } from '@/lib/toast'
import { fieldErrors, useFocusFirstError } from '@/lib/validation'
import type { Role, User } from '@/types/auth'

type UserSectionKey = 'account' | 'personal' | 'permissions'

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  SALES: 'Sales',
}

const ROLES: Role[] = ['SALES', 'MANAGER', 'ADMIN']

const ROLE_STYLES: Record<Role, { bg: string; fg: string }> = {
  ADMIN: { bg: 'var(--warning-bg)', fg: 'var(--warning)' },
  MANAGER: { bg: 'var(--info-bg)', fg: 'var(--info)' },
  SALES: { bg: 'var(--neutral-bg)', fg: 'var(--neutral)' },
}

const adminUsersUrl = `${new URL(import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1').origin}/admin/accounts/user/`

const createUserSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  first_name: z.string().trim(),
  last_name: z.string().trim(),
  email: z.string().trim().email('Enter a valid email.').optional().or(z.literal('')),
  phone: z.string().trim(),
  role: z.enum(['ADMIN', 'MANAGER', 'SALES']),
})

type CreateUserForm = z.infer<typeof createUserSchema>

const emptyForm: CreateUserForm = {
  username: '',
  password: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'SALES',
}

function fullName(user: User) {
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username
}

function RoleBadge({ role }: { role: Role }) {
  const style = ROLE_STYLES[role]
  return (
    <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 11px', borderRadius: 999, background: style.bg, color: style.fg }}>
      {ROLE_LABELS[role]}
    </span>
  )
}

export default function Users() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const formRef = useRef<HTMLFormElement>(null)
  const [search, setSearch] = useState('')
  const [ordering, setOrdering] = useState('username')
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<CreateUserForm>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [openSection, setOpenSection] = useState<UserSectionKey | null>('account')

  useFocusFirstError(errors, formRef)

  function toggleSection(key: UserSectionKey) {
    setOpenSection(current => (current === key ? null : key))
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [search, ordering])

  const users = useQuery({
    queryKey: ['users', search, ordering, currentPage],
    queryFn: () => listUsers({
      search: search.trim() || undefined,
      ordering,
      page: currentPage,
    }),
    enabled: !!currentUser?.is_admin,
  })

  const create = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      setModalOpen(false)
      setForm(emptyForm)
      setErrors({})
      setOpenSection('account')
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      notifySuccess('User created')
    },
    onError: error => notifyError(formErrorMessage(error, 'User could not be created.')),
  })

  function updateField<K extends keyof CreateUserForm>(field: K, value: CreateUserForm[K]) {
    setForm(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: '' }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = createUserSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    create.mutate({
      username: parsed.data.username,
      password: parsed.data.password,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      role: parsed.data.role,
    })
  }

  const rows = users.data?.results ?? []
  const stats = {
    active: rows.filter(user => user.is_active_staff).length,
    admins: rows.filter(user => user.role === 'ADMIN').length,
    managers: rows.filter(user => user.role === 'MANAGER').length,
    sales: rows.filter(user => user.role === 'SALES').length,
  }

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      render: user => {
        const name = fullName(user)
        return (
          <Link to={`/users/${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'inherit', textDecoration: 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 999, background: user.role === 'ADMIN' ? 'var(--warning-bg)' : 'var(--primary-soft)', color: user.role === 'ADMIN' ? 'var(--warning)' : 'var(--primary-hover)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
              {initials(name)}
            </div>
            <div>
              <div style={{ color: 'var(--text)', fontSize: 13.5, fontWeight: 700 }}>{name}</div>
              <div style={{ color: 'var(--muted)', fontSize: 12 }}>@{user.username}</div>
            </div>
          </Link>
        )
      },
    },
    { key: 'role', header: 'Role', render: user => <RoleBadge role={user.role} /> },
    { key: 'phone', header: 'Phone', render: user => user.phone || '-' },
    { key: 'email', header: 'Email', render: user => user.email || '-' },
    { key: 'status', header: 'Status', render: user => <StatusBadge status={user.is_active_staff ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      key: 'capabilities',
      header: 'Capabilities',
      render: user => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {user.can_view_finance && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: 'var(--primary-soft)', color: 'var(--primary-hover)' }}>Finance</span>}
          {user.can_delete && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: 'var(--danger-bg)', color: 'var(--danger)' }}>Delete</span>}
          {!user.can_view_finance && !user.can_delete && <span style={{ color: 'var(--muted)' }}>-</span>}
        </div>
      ),
    },
  ]

  return (
    <Layout>
      <PermissionGate minRole="ADMIN" fallback={
        <div className="app-page">
          <div className="card" style={{ padding: 22, color: 'var(--muted)' }}>Your role cannot view users.</div>
        </div>
      }>
        <div className="app-page">
          <PageHeader
            eyebrow="Insights"
            title="Users"
            subtitle="Staff directory — create accounts, edit roles, and reset passwords."
            actions={(
              <>
                <a href={adminUsersUrl} className="secondary-button">
                  <ShieldCheck size={16} />
                  Django admin
                </a>
                <button type="button" onClick={() => { setOpenSection('account'); setModalOpen(true) }} className="primary-button">
                  <Plus size={16} />
                  New user
                </button>
              </>
            )}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
            <SummaryCard label="Active on page" value={stats.active} caption="Enabled staff accounts" icon={<UsersRound size={18} />} />
            <SummaryCard label="Admins" value={stats.admins} caption="On current page" icon={<ShieldCheck size={18} />} tone="amber" />
            <SummaryCard label="Managers" value={stats.managers} caption="On current page" icon={<UserCog size={18} />} tone="blue" />
            <SummaryCard label="Sales" value={stats.sales} caption="On current page" icon={<UsersRound size={18} />} tone="neutral" />
          </div>

          <DirectoryCard
            title="User directory"
            count={users.data ? `${users.data.count} staff accounts` : 'Loading records'}
            toolbar={(
              <DirectoryToolbar>
                <SearchBox value={search} onChange={setSearch} placeholder="Search users" />
                <DirectorySelect value={ordering} onChange={setOrdering} ariaLabel="Ordering">
                  <option value="username">Username A-Z</option>
                  <option value="-username">Username Z-A</option>
                  <option value="role">Role A-Z</option>
                  <option value="-role">Role Z-A</option>
                </DirectorySelect>
                <button type="button" className="primary-button" onClick={() => setCurrentPage(1)}>
                  <Filter size={16} />
                  Filter
                </button>
              </DirectoryToolbar>
            )}
            footer={users.data && (
              <PaginationFooter
                page={currentPage}
                total={users.data.count}
                hasPrevious={!!users.data.previous}
                hasNext={!!users.data.next}
                onPrevious={() => setCurrentPage(page => Math.max(1, page - 1))}
                onNext={() => setCurrentPage(page => page + 1)}
              />
            )}
          >
            {users.isLoading && <DirectorySkeleton />}
            {users.isError && <div className="error-banner" style={{ margin: '0 18px 18px' }}>{errorMessage(users.error)}</div>}
            {users.data && (
              <DataTable
                columns={columns}
                rows={rows}
                variant="bare"
                empty={<EmptyState icon={<UsersRound size={18} />} title="No users found." subtitle="No staff accounts match the current search." />}
              />
            )}
          </DirectoryCard>
        </div>
      </PermissionGate>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New user"
        description="Create a staff account."
        width={640}
        formRef={formRef}
        onSubmit={submit}
        footer={(
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="secondary-button">Cancel</button>
            <button type="submit" disabled={create.isPending} className="primary-button" style={{ opacity: create.isPending ? .7 : 1 }}>
              {create.isPending ? 'Saving...' : 'Create user'}
            </button>
          </>
        )}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <AccordionCard
            icon={<KeyRound size={17} />}
            title="Account"
            description="Sign-in username and password."
            isOpen={openSection === 'account'}
            isDone={Boolean(form.username && form.password)}
            onToggle={() => toggleSection('account')}
          >
            <FormGrid>
              <Field label="Username" required error={errors.username} name="username">
                <input autoFocus className="control" value={form.username} onChange={event => updateField('username', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
              </Field>
              <Field label="Password" required error={errors.password} name="password">
                <input className="control" type="password" value={form.password} onChange={event => updateField('password', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
              </Field>
            </FormGrid>
          </AccordionCard>

          <AccordionCard
            icon={<IdCard size={17} />}
            title="Personal Information"
            description="Name and contact details."
            isOpen={openSection === 'personal'}
            isDone={Boolean(form.first_name || form.last_name || form.email || form.phone)}
            onToggle={() => toggleSection('personal')}
          >
            <FormGrid>
              <Field label="First name" name="first_name">
                <input className="control" value={form.first_name} onChange={event => updateField('first_name', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
              </Field>
              <Field label="Last name" name="last_name">
                <input className="control" value={form.last_name} onChange={event => updateField('last_name', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
              </Field>
            </FormGrid>
            <FormGrid>
              <Field label="Email" error={errors.email} name="email">
                <input className="control" value={form.email} onChange={event => updateField('email', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
              </Field>
              <Field label="Phone" name="phone">
                <input className="control" value={form.phone} onChange={event => updateField('phone', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
              </Field>
            </FormGrid>
          </AccordionCard>

          <AccordionCard
            icon={<ShieldCheck size={17} />}
            title="Permissions"
            description="What this account is allowed to do."
            isOpen={openSection === 'permissions'}
            isDone
            onToggle={() => toggleSection('permissions')}
          >
            <Field label="Role" name="role">
              <SegmentedControl
                value={form.role}
                options={ROLES.map(role => ({ value: role, label: ROLE_LABELS[role] }))}
                onChange={value => updateField('role', value as Role)}
              />
            </Field>
          </AccordionCard>
        </div>

        {create.isError && <div className="error-banner">{formErrorMessage(create.error, 'User could not be created.')}</div>}
      </Modal>
    </Layout>
  )
}
