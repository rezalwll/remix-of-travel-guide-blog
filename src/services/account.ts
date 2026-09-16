import { backend, type ApiFavorite, type ApiNotification, type ApiPassenger, type ApiRefund, type ApiSupportTicket } from './backend';

export const getPassengers = async () => (await backend.passengers()).passengers;
export const savePassenger = async (passenger: { id?: string; firstName: string; lastName: string; nationalId?: string; passportNumber?: string }) => passenger.id
  ? (await backend.updatePassenger(passenger.id, passenger)).passenger
  : (await backend.createPassenger(passenger)).passenger;
export const removePassenger = (id: string) => backend.deletePassenger(id);
export const getRefunds = async () => (await backend.refunds()).refunds;
export const requestRefund = async (orderId: string, reason: string, destination: 'wallet' | 'original_payment' = 'original_payment') => (await backend.requestRefund(orderId, reason, destination)).refund;
export type Favorite = ApiFavorite & { type: string; title: string; href: string; image?: string };
let favoriteCache: Favorite[] = [];
let favoritesLoading = false;
export const preloadFavorites = async () => {
  if (favoritesLoading) return favoriteCache;
  favoritesLoading = true;
  try {
    const { favorites } = await backend.favorites();
    favoriteCache = favorites.map((item) => ({ ...item, type: item.itemType, title: item.itemId, href: `/${item.itemType}s/${item.itemId}` }));
    return favoriteCache;
  } finally { favoritesLoading = false; }
};
export const clearFavoriteCache = () => { favoriteCache = []; };
const syncFavorites = () => {
  if (favoritesLoading) return;
  void preloadFavorites();
};
export const getFavorites = (_userId?: string): Favorite[] => { syncFavorites(); return favoriteCache; };
export const toggleFavorite = (favorite: { type: string; itemId: string; title: string; href: string; image?: string; userId?: string }): Favorite[] => {
  const existing = favoriteCache.find((item) => item.itemType === favorite.type && item.itemId === favorite.itemId);
  if (existing) {
    favoriteCache = favoriteCache.filter((item) => item.id !== existing.id);
    void backend.deleteFavorite(existing.id);
  } else {
    const optimistic: Favorite = { id: `pending-${favorite.type}-${favorite.itemId}`, itemType: favorite.type, itemId: favorite.itemId, createdAt: new Date().toISOString(), type: favorite.type, title: favorite.title, href: favorite.href, image: favorite.image };
    favoriteCache = [...favoriteCache, optimistic];
    void backend.createFavorite(favorite.type, favorite.itemId).then(({ favorite: saved }) => { favoriteCache = favoriteCache.map((item) => item.id === optimistic.id ? { ...optimistic, ...saved } : item); });
  }
  return favoriteCache;
};
export const getNotifications = async () => (await backend.notifications()).notifications;
export const markNotificationRead = (id: string) => backend.readNotification(id);
export const markAllNotificationsRead = () => backend.readAllNotifications();
export const getTickets = async () => (await backend.support()).tickets;
export const createTicket = async (subject: string, message: string) => (await backend.createSupport(subject, message)).ticket;
export const replyTicket = async (ticketId: string, message: string) => backend.replySupport(ticketId, message);

export type Passenger = ApiPassenger;
export type Refund = ApiRefund;
export type Notification = ApiNotification;
export type Ticket = ApiSupportTicket;
