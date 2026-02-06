import { createContext, useContext } from 'react'
import { useCompanySettings } from '@/hooks/use-company-settings'
import type { CompanySettings } from '@/lib/types'

type CompanyContextType = {
  company: CompanySettings | null
  isReady: boolean
}

const CompanyContext = createContext<CompanyContextType>({
  company: null,
  isReady: false,
})

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useCompanySettings()

  return (
    <CompanyContext.Provider
      value={{
        company: data ?? null,
        isReady: !isLoading && !!data,
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  return useContext(CompanyContext)
}
