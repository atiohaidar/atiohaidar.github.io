import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Configure default options for all queries
const defaultOptions: DefaultOptions = {
  queries: {
    // Stale time - data is considered fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Cache time - data stays in cache for 10 minutes after becoming unused
    gcTime: 10 * 60 * 1000,
    // Retry failed requests up to 2 times
    retry: 2,
    // Retry delay increases exponentially
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch on window focus
    refetchOnWindowFocus: false,
    // Refetch on reconnect
    refetchOnReconnect: true,
    // Refetch on mount if data is stale
    refetchOnMount: true,
  },
  mutations: {
    // Retry mutations once
    retry: 1,
  },
};

// Create a client
export const queryClient = new QueryClient({
  defaultOptions,
});

// Query keys for better organization and type safety
export const queryKeys = {
  // Auth
  currentUser: ['currentUser'] as const,
  
  // Stats
  stats: ['stats'] as const,
  
  // Users
  users: ['users'] as const,
  user: (username: string) => ['users', username] as const,
  
  // Tasks
  tasks: ['tasks'] as const,
  task: (slug: string) => ['tasks', slug] as const,
  
  // Articles
  articles: ['articles'] as const,
  article: (slug: string) => ['articles', slug] as const,
  
  // Rooms
  rooms: (available?: boolean) => 
    available !== undefined ? ['rooms', { available }] : ['rooms'] as const,
  room: (roomId: string) => ['rooms', roomId] as const,
  
  // Bookings
  bookings: ['bookings'] as const,
  booking: (bookingId: string) => ['bookings', bookingId] as const,
  
  // Conversations
  conversations: ['conversations'] as const,
  conversation: (username: string) => ['conversations', username] as const,
  conversationMessages: (conversationId: string) => 
    ['conversations', conversationId, 'messages'] as const,
  
  // Groups
  groups: ['groups'] as const,
  group: (groupId: string) => ['groups', groupId] as const,
  groupMessages: (groupId: string) => ['groups', groupId, 'messages'] as const,
  groupMembers: (groupId: string) => ['groups', groupId, 'members'] as const,
  
  // Anonymous
  anonymousMessages: ['anonymous', 'messages'] as const,
};
