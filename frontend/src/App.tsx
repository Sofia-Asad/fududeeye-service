import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Dashboard from '@/pages/Dashboard'
import Items from '@/pages/Items'
import NewSale from '@/pages/NewSale'
import Demands from '@/pages/Demands'
import Complaints from '@/pages/Complaints'
import Expenses from '@/pages/Expenses'
import PendingPayouts from '@/pages/PendingPayouts'
import Reports from '@/pages/Reports'
import AuditLog from '@/pages/AuditLog'
import Users from '@/pages/Users'
import CustomerDetail from '@/pages/CustomerDetail'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Navigate to="/customers/1" replace />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/items" element={<Items />} />
          <Route path="/sales/new" element={<NewSale />} />
          <Route path="/demands" element={<Demands />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/payouts" element={<PendingPayouts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/audit" element={<AuditLog />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
