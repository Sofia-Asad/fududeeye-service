import { Route, Routes } from 'react-router-dom'

import AuthLayout from '@/layout/AuthLayout'
import CenteredAuthLayout from '@/layout/CenteredAuthLayout'
import MainLayout from '@/layout/MainLayout'
import About from '@/pages/About'
import BrowseListings from '@/pages/BrowseListings'
import Contact from '@/pages/Contact'
import EmailSent from '@/pages/EmailSent'
import FAQ from '@/pages/FAQ'
import ForgotPassword from '@/pages/ForgotPassword'
import Home from '@/pages/Home'
import ListingDetail from '@/pages/ListingDetail'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import PasswordChanged from '@/pages/PasswordChanged'
import ResetPassword from '@/pages/ResetPassword'
import Services from '@/pages/Services'
import GuestRoute from '@/router/GuestRoute'

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<BrowseListings />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
      </Route>

      <Route element={<CenteredAuthLayout />}>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password/sent" element={<EmailSent />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/success" element={<PasswordChanged />} />
      </Route>
    </Routes>
  )
}
