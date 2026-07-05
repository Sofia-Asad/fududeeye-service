export type Role = 'ADMIN' | 'MANAGER' | 'SALES'

export interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  role: Role
  phone: string
  is_active_staff: boolean
  is_admin: boolean
  is_manager: boolean
  can_view_finance: boolean
  can_delete: boolean
}

export interface UserCreatePayload {
  username: string
  password: string
  first_name?: string
  last_name?: string
  email?: string
  role: Role
  phone?: string
  is_active_staff?: boolean
}

export interface UserUpdatePayload {
  first_name?: string
  last_name?: string
  email?: string
  role?: Role
  phone?: string
  is_active_staff?: boolean
}
