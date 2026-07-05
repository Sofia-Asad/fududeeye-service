import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, KeyRound, Pencil, Save, ShieldCheck, UserCog, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { getUser, resetUserPassword, updateUser } from '@/api/accounts'
import { useAuth } from '@/auth/AuthContext'
import DetailMeta from '@/components/DetailMeta'
import FormSection, { FieldLabel, FormGrid } from '@/components/FormSection'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import { SkeletonLines } from '@/components/Skeleton'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import { errorMessage, formErrorMessage } from '@/lib/errors'
import { notifyError, notifySuccess } from '@/lib/toast'
import { fieldErrors, useFocusFirstError } from '@/lib/validation'
import type { Role, User, UserUpdatePayload } from '@/types/auth'

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  SALES: 'Sales',
}

const ROLES: Role[] = ['SALES', 'MANAGER', 'ADMIN']

interface ProfileForm {
  first_name: string
  last_name: string
  email: string
  phone: string
  role: Role
  is_active_staff: boolean
}

function formFromUser(user: User): ProfileForm {
  return {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    is_active_staff: user.is_active_staff,
  }
}

function fullName(user: User) {
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username
}

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm the new password.'),
  })
  .refine(value => value.newPassword === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })

export default function UserDetail() {
  const { id } = useParams()
  const userId = Number(id)
  const validUserId = Number.isFinite(userId) && userId > 0
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [form, setForm] = useState<ProfileForm | null>(null)
  const passwordFormRef = useRef<HTMLFormElement>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

  useFocusFirstError(passwordErrors, passwordFormRef)

  const target = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId),
    enabled: validUserId,
  })

  useEffect(() => {
    if (!target.data) return
    setForm(formFromUser(target.data))
  }, [target.data])

  const isSelf = target.data?.id === currentUser?.id

  const save = useMutation({
    mutationFn: (payload: UserUpdatePayload) => updateUser(userId, payload),
    onSuccess: updated => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.setQueryData(['user', userId], updated)
      notifySuccess('User updated')
      setMode('view')
    },
    onError: error => notifyError(formErrorMessage(error, 'User could not be updated.')),
  })

  const resetPassword = useMutation({
    mutationFn: () => resetUserPassword(userId, newPassword),
    onSuccess: () => {
      setNewPassword('')
      setConfirmPassword('')
      setPasswordErrors({})
      notifySuccess('Password reset')
    },
    onError: error => notifyError(formErrorMessage(error, 'Password could not be reset.')),
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form) return
    save.mutate(form)
  }

  function cancelEdit() {
    if (target.data) setForm(formFromUser(target.data))
    setMode('view')
  }

  function submitPasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = passwordSchema.safeParse({ newPassword, confirmPassword })
    if (!parsed.success) {
      setPasswordErrors(fieldErrors(parsed.error))
      return
    }
    resetPassword.mutate()
  }

  if (!validUserId) {
    return <Layout><div className="app-page"><div className="error-banner">User not found.</div></div></Layout>
  }

  if (target.isLoading || !form) {
    return (
      <Layout>
        <div className="app-page">
          <SkeletonLines widths={['32%', '70%']} />
        </div>
      </Layout>
    )
  }

  if (target.isError || !target.data) {
    return <Layout><div className="app-page"><div className="error-banner">{errorMessage(target.error)}</div></div></Layout>
  }

  const current = target.data

  return (
    <Layout>
      <div className="app-page">
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <Link to="/users" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--primary-hover)', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginBottom: 14 }}>
            <ArrowLeft size={16} />
            Users
          </Link>

          <PageHeader
            eyebrow="User detail"
            title={fullName(current)}
            subtitle={`@${current.username} · ${ROLE_LABELS[current.role]}`}
            actions={(
              <>
                <StatusBadge status={current.is_active_staff ? 'ACTIVE' : 'INACTIVE'} />
                {mode === 'view' && (
                  <button type="button" onClick={() => setMode('edit')} className="secondary-button">
                    <Pencil size={16} />
                    Edit
                  </button>
                )}
                <Link to={`/audit?model=User&object_id=${current.id}`} className="secondary-button">
                  <ShieldCheck size={16} />
                  Audit history
                </Link>
              </>
            )}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
            <SummaryCard label="Role" value={ROLE_LABELS[current.role]} caption="Access level" icon={<UserCog size={18} />} tone="blue" />
            <SummaryCard label="Status" value={current.is_active_staff ? 'Active' : 'Inactive'} caption="Can sign in" icon={<ShieldCheck size={18} />} tone={current.is_active_staff ? 'primary' : 'neutral'} />
            <SummaryCard label="Finance access" value={current.can_view_finance ? 'Yes' : 'No'} caption="Expenses and profit" icon={<ShieldCheck size={18} />} tone="amber" />
            <SummaryCard label="Hard delete" value={current.can_delete ? 'Yes' : 'No'} caption="Admin capability" icon={<ShieldCheck size={18} />} tone="neutral" />
          </div>

          <div className="content-sidebar-grid">
            {mode === 'edit' ? (
              <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
                <FormSection icon={<UserCog size={18} />} title="Profile" description="Update contact details, role, and account status.">
                  <FormGrid>
                    <FieldLabel label="First name">
                      <input className="control" value={form.first_name} onChange={event => setForm(cur => cur && ({ ...cur, first_name: event.target.value }))} style={{ width: '100%', padding: '0 12px' }} />
                    </FieldLabel>
                    <FieldLabel label="Last name">
                      <input className="control" value={form.last_name} onChange={event => setForm(cur => cur && ({ ...cur, last_name: event.target.value }))} style={{ width: '100%', padding: '0 12px' }} />
                    </FieldLabel>
                    <FieldLabel label="Email">
                      <input className="control" value={form.email} onChange={event => setForm(cur => cur && ({ ...cur, email: event.target.value }))} style={{ width: '100%', padding: '0 12px' }} />
                    </FieldLabel>
                    <FieldLabel label="Phone">
                      <input className="control" value={form.phone} onChange={event => setForm(cur => cur && ({ ...cur, phone: event.target.value }))} style={{ width: '100%', padding: '0 12px' }} />
                    </FieldLabel>
                    <FieldLabel label="Role" helper={isSelf ? "You can't change your own role." : undefined}>
                      <select disabled={isSelf} className="control" value={form.role} onChange={event => setForm(cur => cur && ({ ...cur, role: event.target.value as Role }))} style={{ width: '100%', padding: '0 12px' }}>
                        {ROLES.map(role => (
                          <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                        ))}
                      </select>
                    </FieldLabel>
                    <FieldLabel label="Account status" helper={isSelf ? "You can't deactivate your own account." : undefined}>
                      <label className="checkbox-row" style={{ height: 44 }}>
                        <input
                          type="checkbox"
                          disabled={isSelf}
                          checked={form.is_active_staff}
                          onChange={event => setForm(cur => cur && ({ ...cur, is_active_staff: event.target.checked }))}
                        />
                        Active (can sign in)
                      </label>
                    </FieldLabel>
                  </FormGrid>
                </FormSection>

                {save.isError && <div className="error-banner">{formErrorMessage(save.error, 'User could not be updated.')}</div>}

                <div className="card action-footer">
                  <div className="action-footer-note" />
                  <div className="action-footer-actions">
                    <button type="button" onClick={cancelEdit} className="secondary-button">
                      <X size={16} />
                      Cancel
                    </button>
                    <button type="submit" disabled={save.isPending} className="primary-button" style={{ opacity: save.isPending ? .7 : 1 }}>
                      <Save size={16} />
                      {save.isPending ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <DetailMeta
                title="Profile"
                rows={[
                  { label: 'Username', value: `@${current.username}` },
                  { label: 'First name', value: current.first_name || '-' },
                  { label: 'Last name', value: current.last_name || '-' },
                  { label: 'Email', value: current.email || '-' },
                  { label: 'Phone', value: current.phone || '-' },
                  { label: 'Role', value: ROLE_LABELS[current.role] },
                  { label: 'Status', value: <StatusBadge status={current.is_active_staff ? 'ACTIVE' : 'INACTIVE'} /> },
                ]}
              />
            )}

            <aside style={{ display: 'grid', gap: 16 }}>
              <section className="card" style={{ padding: 20 }}>
                <h2 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>Reset password</h2>
                <p style={{ margin: '0 0 14px', color: 'var(--muted)', fontSize: 12.5 }}>
                  Sets a new password immediately — share it with {fullName(current)} directly.
                </p>
                <form ref={passwordFormRef} onSubmit={submitPasswordReset} style={{ display: 'grid', gap: 14 }}>
                  <label className="field-label" data-error={!!passwordErrors.newPassword} data-field="newPassword">
                    <span className="field-title">New password</span>
                    <input
                      className="control"
                      type="password"
                      value={newPassword}
                      onChange={event => { setNewPassword(event.target.value); setPasswordErrors(cur => ({ ...cur, newPassword: '' })) }}
                    />
                    {passwordErrors.newPassword && <span className="field-error">{passwordErrors.newPassword}</span>}
                  </label>
                  <label className="field-label" data-error={!!passwordErrors.confirmPassword} data-field="confirmPassword">
                    <span className="field-title">Confirm password</span>
                    <input
                      className="control"
                      type="password"
                      value={confirmPassword}
                      onChange={event => { setConfirmPassword(event.target.value); setPasswordErrors(cur => ({ ...cur, confirmPassword: '' })) }}
                    />
                    {passwordErrors.confirmPassword && <span className="field-error">{passwordErrors.confirmPassword}</span>}
                  </label>
                  {resetPassword.isError && <div className="error-banner">{formErrorMessage(resetPassword.error, 'Password could not be reset.')}</div>}
                  <button type="submit" disabled={resetPassword.isPending} className="primary-button" style={{ opacity: resetPassword.isPending ? .7 : 1 }}>
                    <KeyRound size={16} />
                    {resetPassword.isPending ? 'Resetting...' : 'Reset password'}
                  </button>
                </form>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  )
}
