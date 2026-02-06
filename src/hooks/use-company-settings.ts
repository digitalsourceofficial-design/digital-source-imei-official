import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCompanySettings, saveCompanySettings as saveCompanySettingsApi } from '@/lib/storage';
import type { CompanySettings } from '@/lib/types';

const QUERY_KEY = ['company-settings'];

export function useCompanySettings() {
  return useQuery<CompanySettings>({
    queryKey: QUERY_KEY,
    queryFn: getCompanySettings,
    staleTime: 5 * 60 * 1000, // 5 menit
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateCompanySettings() {
  const queryClient = useQueryClient();

  const updateSettings = async (settings: CompanySettings) => {
    await saveCompanySettingsApi(settings);

    // update cache langsung (tanpa flicker)
    queryClient.setQueryData(QUERY_KEY, settings);
  };

  return { updateSettings };
}
