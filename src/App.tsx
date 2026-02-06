import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'

import Index from './pages/Index'
import Layanan from './pages/Layanan'
import LacakPesanan from './pages/LacakPesanan'
import Referral from './pages/Referral'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      {/* USER AREA */}
      <Route element={<AppLayout />}>
        <Route index element={<Index />} />
        <Route path="layanan" element={<Layanan />} />
        <Route path="lacak" element={<LacakPesanan />} />
        <Route path="referral" element={<Referral />} />
      </Route>

      {/* ADMIN AREA (TANPA HEADER USER) */}
      <Route path="/admin/*" element={<Admin />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
