 import { useQuery, useQueryClient } from '@tanstack/react-query';
 import { getReferrals, getReferralByCode, saveReferral as saveReferralApi, deleteReferral as deleteReferralApi } from '@/lib/storage';
 import type { Referral } from '@/lib/types';
 
 const REFERRALS_KEY = ['referrals'];
 
 export function useReferrals() {
   return useQuery({
     queryKey: REFERRALS_KEY,
     queryFn: getReferrals,
     staleTime: 30 * 1000,
     gcTime: 5 * 60 * 1000,
   });
 }
 
 export function useReferralMutations() {
   const queryClient = useQueryClient();
 
   const saveReferral = async (referral: Referral) => {
     await saveReferralApi(referral);
     queryClient.invalidateQueries({ queryKey: REFERRALS_KEY });
   };
 
   const deleteReferral = async (referralCode: string) => {
     await deleteReferralApi(referralCode);
     queryClient.invalidateQueries({ queryKey: REFERRALS_KEY });
   };
 
   return { saveReferral, deleteReferral };
 }