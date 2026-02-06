import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useCompany } from '@/context/company-context'

export function AppLayout() {
  const { isReady } = useCompany()

  if (!isReady) {
    return <div className="h-screen bg-background" />
    // atau <LayoutSkeleton />
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
