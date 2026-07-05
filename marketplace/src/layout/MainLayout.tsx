import { Outlet } from 'react-router-dom'

import Footer from '@/layout/Footer'
import Navbar from '@/layout/Navbar'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
