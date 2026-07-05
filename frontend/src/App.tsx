import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { AuthProvider } from '@/auth/AuthContext'
import ProtectedRoute from '@/auth/ProtectedRoute'
import { SkeletonLines } from '@/components/Skeleton'
import Dashboard from '@/pages/Dashboard'
import ItemDetail from '@/pages/ItemDetail'
import Items from '@/pages/Items'
import NewItem from '@/pages/NewItem'
import NewSale from '@/pages/NewSale'
import Demands from '@/pages/Demands'
import Complaints from '@/pages/Complaints'
import ComplaintDetail from '@/pages/ComplaintDetail'
import Inquiries from '@/pages/Inquiries'
import InquiryDetail from '@/pages/InquiryDetail'
import Expenses from '@/pages/Expenses'
import ExpenseDetail from '@/pages/ExpenseDetail'
import PendingPayouts from '@/pages/PendingPayouts'
import DemandDetail from '@/pages/DemandDetail'
import SaleDetail from '@/pages/SaleDetail'
import Sales from '@/pages/Sales'
import CustomerDetail from '@/pages/CustomerDetail'
import Customers from '@/pages/Customers'
import Login from '@/pages/Login'
import NewCustomer from '@/pages/NewCustomer'

const ProfitReport = lazy(() => import('@/pages/ProfitReport'))
const Reports = lazy(() => import('@/pages/Reports'))
const SalesReport = lazy(() => import('@/pages/SalesReport'))
const AuditLog = lazy(() => import('@/pages/AuditLog'))
const Users = lazy(() => import('@/pages/Users'))
const UserDetail = lazy(() => import('@/pages/UserDetail'))

const queryClient = new QueryClient()

function RouteFallback() {
  return (
    <div className="app-page">
      <SkeletonLines />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              fontFamily: 'var(--font)',
              borderRadius: 12,
              border: '1px solid var(--border)',
            },
          }}
        />
        <BrowserRouter basename="/crm">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
            <Route path="/customers/new" element={<ProtectedRoute><NewCustomer /></ProtectedRoute>} />
            <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetail /></ProtectedRoute>} />
            <Route path="/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
            <Route path="/items/new" element={<ProtectedRoute><NewItem /></ProtectedRoute>} />
            <Route path="/items/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
            <Route path="/sales/new" element={<ProtectedRoute><NewSale /></ProtectedRoute>} />
            <Route path="/sales/:id" element={<ProtectedRoute><SaleDetail /></ProtectedRoute>} />
            <Route path="/demands" element={<ProtectedRoute><Demands /></ProtectedRoute>} />
            <Route path="/demands/:id" element={<ProtectedRoute><DemandDetail /></ProtectedRoute>} />
            <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
            <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetail /></ProtectedRoute>} />
            <Route path="/inquiries" element={<ProtectedRoute><Inquiries /></ProtectedRoute>} />
            <Route path="/inquiries/:id" element={<ProtectedRoute><InquiryDetail /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
            <Route path="/expenses/:id" element={<ProtectedRoute><ExpenseDetail /></ProtectedRoute>} />
            <Route path="/sales/payouts" element={<ProtectedRoute><PendingPayouts /></ProtectedRoute>} />
            <Route path="/payouts" element={<Navigate to="/sales/payouts" replace />} />
            <Route path="/reports" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><Reports /></Suspense></ProtectedRoute>} />
            <Route path="/reports/sales" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><SalesReport /></Suspense></ProtectedRoute>} />
            <Route path="/reports/profit" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><ProfitReport /></Suspense></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><AuditLog /></Suspense></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><Users /></Suspense></ProtectedRoute>} />
            <Route path="/users/:id" element={<ProtectedRoute><Suspense fallback={<RouteFallback />}><UserDetail /></Suspense></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
