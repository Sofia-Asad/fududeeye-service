import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import ToastProvider from '@/components/ui/ToastProvider'
import AppRouter from '@/router/AppRouter'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider />
        <AppRouter />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
