import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AuthProvider } from '@/auth/AuthContext'
import ProtectedRoute from '@/auth/ProtectedRoute'
import Dashboard from '@/pages/Dashboard'
import ItemDetail from '@/pages/ItemDetail'
import Items from '@/pages/Items'
import NewItem from '@/pages/NewItem'
import NewSale from '@/pages/NewSale'
import Demands from '@/pages/Demands'
import Complaints from '@/pages/Complaints'
import ComplaintDetail from '@/pages/ComplaintDetail'
import Expenses from '@/pages/Expenses'
import PendingPayouts from '@/pages/PendingPayouts'
import ProfitReport from '@/pages/ProfitReport'
import Reports from '@/pages/Reports'
import SalesReport from '@/pages/SalesReport'
import AuditLog from '@/pages/AuditLog'
import Users from '@/pages/Users'
import DemandDetail from '@/pages/DemandDetail'
import SaleDetail from '@/pages/SaleDetail'
import Sales from '@/pages/Sales'
import CustomerDetail from '@/pages/CustomerDetail'
import Customers from '@/pages/Customers'
import Login from '@/pages/Login'
import NewCustomer from '@/pages/NewCustomer'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
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
            <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
            <Route path="/sales/payouts" element={<ProtectedRoute><PendingPayouts /></ProtectedRoute>} />
            <Route path="/payouts" element={<Navigate to="/sales/payouts" replace />} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/reports/sales" element={<ProtectedRoute><SalesReport /></ProtectedRoute>} />
            <Route path="/reports/profit" element={<ProtectedRoute><ProfitReport /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
