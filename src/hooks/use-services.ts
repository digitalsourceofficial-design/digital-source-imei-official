 import { useQuery, useQueryClient } from '@tanstack/react-query';
 import { getServices, getActiveServices, saveService as saveServiceApi, deleteService as deleteServiceApi } from '@/lib/storage';
 import type { Service } from '@/lib/types';
 
 const SERVICES_KEY = ['services'];
 const ACTIVE_SERVICES_KEY = ['services', 'active'];
 
 export function useServices() {
   return useQuery({
     queryKey: SERVICES_KEY,
     queryFn: getServices,
     staleTime: 5 * 60 * 1000, // 5 minutes
     gcTime: 10 * 60 * 1000,
   });
 }
 
 export function useActiveServices() {
   return useQuery({
     queryKey: ACTIVE_SERVICES_KEY,
     queryFn: getActiveServices,
     staleTime: 5 * 60 * 1000,
     gcTime: 10 * 60 * 1000,
   });
 }
 
 export function useServiceMutations() {
   const queryClient = useQueryClient();
 
   const saveService = async (service: Service) => {
     await saveServiceApi(service);
     queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
     queryClient.invalidateQueries({ queryKey: ACTIVE_SERVICES_KEY });
   };
 
   const deleteService = async (serviceId: string) => {
     await deleteServiceApi(serviceId);
     queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
     queryClient.invalidateQueries({ queryKey: ACTIVE_SERVICES_KEY });
   };
 
   return { saveService, deleteService };
 }