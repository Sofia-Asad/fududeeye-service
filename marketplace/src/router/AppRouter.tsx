import { Route, Routes } from 'react-router-dom'

import MainLayout from '@/layout/MainLayout'
import About from '@/pages/About'
import BrowseListings from '@/pages/BrowseListings'
import Contact from '@/pages/Contact'
import FAQ from '@/pages/FAQ'
import Home from '@/pages/Home'
import ListingDetail from '@/pages/ListingDetail'
import NotFound from '@/pages/NotFound'
import Services from '@/pages/Services'

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
    </Routes>
  )
}
