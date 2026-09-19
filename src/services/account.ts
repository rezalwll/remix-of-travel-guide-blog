import {
  backend,
  type ApiFavorite,
  type ApiNotification,
  type ApiPassenger,
  type ApiRefund,
  type ApiSupportTicket,
} from "./backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const getPassengers = async () =>
  (await backend.passengers()).passengers;
export const savePassenger = async (passenger: {
  id?: string;
  firstName: string;
  lastName: string;
  nationalId?: string;
  passportNumber?: string;
}) =>
  passenger.id
    ? (await backend.updatePassenger(passenger.id, passenger)).passenger
    : (await backend.createPassenger(passenger)).passenger;
export const removePassenger = (id: string) => backend.deletePassenger(id);
export const getRefunds = async () => (await backend.refunds()).refunds;
export const requestRefund = async (
  orderId: string,
  reason: string,
  destination: "wallet" | "original_payment" = "original_payment",
) => (await backend.requestRefund(orderId, reason, destination)).refund;
export const favoriteQueryKey = ["account", "favorites"] as const;
export const useFavorite = (
  enabled: boolean,
  itemType: string,
  itemId: string,
) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: favoriteQueryKey,
    queryFn: async () => (await backend.favorites()).favorites,
    enabled,
    staleTime: 30_000,
  });
  const existing = query.data?.find(
    (item) => item.itemType === itemType && item.itemId === itemId,
  );
  const mutation = useMutation({
    mutationFn: async () =>
      existing
        ? backend.deleteFavorite(existing.id)
        : backend.createFavorite(itemType, itemId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: favoriteQueryKey });
      const previous =
        queryClient.getQueryData<ApiFavorite[]>(favoriteQueryKey) ?? [];
      queryClient.setQueryData<ApiFavorite[]>(
        favoriteQueryKey,
        existing
          ? previous.filter((item) => item.id !== existing.id)
          : [
              ...previous,
              {
                id: `pending-${itemType}-${itemId}`,
                itemType,
                itemId,
                createdAt: new Date().toISOString(),
              },
            ],
      );
      return { previous };
    },
    onError: (_error, _variables, context) =>
      queryClient.setQueryData(favoriteQueryKey, context?.previous),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: favoriteQueryKey }),
  });
  return {
    favorite: !!existing,
    toggle: mutation.mutate,
    pending: mutation.isPending,
    error: mutation.error,
  };
};
export const getNotifications = async () =>
  (await backend.notifications()).notifications;
export const markNotificationRead = (id: string) =>
  backend.readNotification(id);
export const markAllNotificationsRead = () => backend.readAllNotifications();
export const getTickets = async () => (await backend.support()).tickets;
export const createTicket = async (subject: string, message: string) =>
  (await backend.createSupport(subject, message)).ticket;
export const replyTicket = async (ticketId: string, message: string) =>
  backend.replySupport(ticketId, message);

export type Passenger = ApiPassenger;
export type Refund = ApiRefund;
export type Notification = ApiNotification;
export type Ticket = ApiSupportTicket;
