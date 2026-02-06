 import { useQuery, useQueryClient } from '@tanstack/react-query';
 import { getOrders, getOrderById, getOrderByImei, updateOrderStatus as updateOrderStatusApi, saveOrder as saveOrderApi, deleteOrder as deleteOrderApi } from '@/lib/storage';
 import type { Order, OrderStatus } from '@/lib/types';
 
 const ORDERS_KEY = ['orders'];
 
 export function useOrders() {
   return useQuery({
     queryKey: ORDERS_KEY,
     queryFn: getOrders,
     staleTime: 30 * 1000, // 30 seconds
     gcTime: 5 * 60 * 1000, // 5 minutes
   });
 }
 
 export function useOrderById(orderId: string | null) {
   return useQuery({
     queryKey: ['order', orderId],
     queryFn: () => orderId ? getOrderById(orderId) : null,
     enabled: !!orderId,
     staleTime: 30 * 1000,
   });
 }
 
 export function useOrderSearch() {
   const queryClient = useQueryClient();
 
   const searchOrder = async (query: string): Promise<Order | undefined> => {
     // Try by order ID first
     let order = await getOrderById(query);
     if (!order) {
       order = await getOrderByImei(query);
     }
     return order;
   };
 
   return { searchOrder };
 }
 
 export function useOrderMutations() {
   const queryClient = useQueryClient();
 
   const updateOrderStatus = async (orderId: string, status: OrderStatus, failureReason?: string) => {
     const result = await updateOrderStatusApi(orderId, status, failureReason);
     // Immediately invalidate to refetch fresh data
     queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
     queryClient.invalidateQueries({ queryKey: ['order', orderId] });
     return result;
   };
 
   const saveOrder = async (order: Order) => {
     await saveOrderApi(order);
     queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
   };
 
   const deleteOrder = async (orderId: string) => {
     await deleteOrderApi(orderId);
     queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
   };
 
   return { updateOrderStatus, saveOrder, deleteOrder };
 }