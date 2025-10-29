import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ApiService from './api';
import { queryKeys } from './queryClient';
import * as Types from '@/types/api';

// ============================================================================
// Auth Hooks
// ============================================================================

export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => ApiService.getCurrentUser(),
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: Types.LoginRequest) => 
      ApiService.login(credentials),
    onSuccess: (data) => {
      // Update the current user in the cache
      queryClient.setQueryData(queryKeys.currentUser, data.user);
      // Invalidate all queries to refetch with new auth
      queryClient.invalidateQueries();
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => ApiService.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
};

// ============================================================================
// Stats Hooks
// ============================================================================

export const useStats = () => {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => ApiService.getStats(),
  });
};

// ============================================================================
// User Hooks
// ============================================================================

export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => ApiService.listUsers(),
  });
};

export const useUser = (username: string) => {
  return useQuery({
    queryKey: queryKeys.user(username),
    queryFn: () => ApiService.getUser(username),
    enabled: !!username,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (user: Types.UserCreate) => ApiService.createUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ username, updates }: { username: string; updates: Types.UserUpdate }) =>
      ApiService.updateUser(username, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.username) });
      // Update current user if updating own profile
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
};

export const useUpdateSelfProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Types.UserUpdate) => ApiService.updateSelfProfile(updates),
    onSuccess: (data) => {
      // Update current user in cache
      queryClient.setQueryData(queryKeys.currentUser, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (username: string) => ApiService.deleteUser(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

// ============================================================================
// Task Hooks
// ============================================================================

export const useTasks = () => {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => ApiService.listTasks(),
  });
};

export const useTask = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.task(slug),
    queryFn: () => ApiService.getTask(slug),
    enabled: !!slug,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (task: Types.TaskCreate) => ApiService.createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ slug, updates }: { slug: string; updates: Types.TaskUpdate }) =>
      ApiService.updateTask(slug, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.task(variables.slug) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => ApiService.deleteTask(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

// ============================================================================
// Article Hooks
// ============================================================================

export const useArticles = () => {
  return useQuery({
    queryKey: queryKeys.articles,
    queryFn: () => ApiService.listArticles(),
  });
};

export const useArticle = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.article(slug),
    queryFn: () => ApiService.getArticle(slug),
    enabled: !!slug,
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (article: Types.ArticleCreate) => ApiService.createArticle(article),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ slug, updates }: { slug: string; updates: Types.ArticleUpdate }) =>
      ApiService.updateArticle(slug, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles });
      queryClient.invalidateQueries({ queryKey: queryKeys.article(variables.slug) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => ApiService.deleteArticle(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

// ============================================================================
// Room Hooks
// ============================================================================

export const useRooms = (available?: boolean) => {
  return useQuery({
    queryKey: queryKeys.rooms(available),
    queryFn: () => ApiService.listRooms(available),
  });
};

export const useRoom = (roomId: string) => {
  return useQuery({
    queryKey: queryKeys.room(roomId),
    queryFn: () => ApiService.getRoom(roomId),
    enabled: !!roomId,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (room: Types.RoomCreate) => ApiService.createRoom(room),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ roomId, updates }: { roomId: string; updates: Types.RoomUpdate }) =>
      ApiService.updateRoom(roomId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: queryKeys.room(variables.roomId) });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (roomId: string) => ApiService.deleteRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

// ============================================================================
// Booking Hooks
// ============================================================================

export const useBookings = () => {
  return useQuery({
    queryKey: queryKeys.bookings,
    queryFn: () => ApiService.listBookings(),
  });
};

export const useBooking = (bookingId: string) => {
  return useQuery({
    queryKey: queryKeys.booking(bookingId),
    queryFn: () => ApiService.getBooking(bookingId),
    enabled: !!bookingId,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (booking: Types.BookingCreate) => ApiService.createBooking(booking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, updates }: { bookingId: string; updates: Types.BookingUpdate }) =>
      ApiService.updateBookingStatus(bookingId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking(variables.bookingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bookingId: string) => ApiService.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

// ============================================================================
// Chat Hooks
// ============================================================================

export const useConversations = () => {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: () => ApiService.listConversations(),
  });
};

export const useConversation = (username: string) => {
  return useQuery({
    queryKey: queryKeys.conversation(username),
    queryFn: () => ApiService.getOrCreateConversation(username),
    enabled: !!username,
  });
};

export const useConversationMessages = (conversationId: string) => {
  return useQuery({
    queryKey: queryKeys.conversationMessages(conversationId),
    queryFn: () => ApiService.getConversationMessages(conversationId),
    enabled: !!conversationId,
    // Refetch messages more frequently for real-time feel
    refetchInterval: 5000,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (message: Types.MessageCreate) => ApiService.sendMessage(message),
    onSuccess: (data) => {
      // Invalidate conversation messages
      if (data.conversation_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.conversationMessages(data.conversation_id) 
        });
      }
      if (data.group_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.groupMessages(data.group_id) 
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
};

// ============================================================================
// Group Chat Hooks
// ============================================================================

export const useGroups = () => {
  return useQuery({
    queryKey: queryKeys.groups,
    queryFn: () => ApiService.listGroups(),
  });
};

export const useGroup = (groupId: string) => {
  return useQuery({
    queryKey: queryKeys.group(groupId),
    queryFn: () => ApiService.getGroup(groupId),
    enabled: !!groupId,
  });
};

export const useGroupMessages = (groupId: string) => {
  return useQuery({
    queryKey: queryKeys.groupMessages(groupId),
    queryFn: () => ApiService.getGroupMessages(groupId),
    enabled: !!groupId,
    // Refetch messages more frequently for real-time feel
    refetchInterval: 5000,
  });
};

export const useGroupMembers = (groupId: string) => {
  return useQuery({
    queryKey: queryKeys.groupMembers(groupId),
    queryFn: () => ApiService.getGroupMembers(groupId),
    enabled: !!groupId,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (group: Types.GroupChatCreate) => ApiService.createGroup(group),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, updates }: { groupId: string; updates: Types.GroupChatUpdate }) =>
      ApiService.updateGroup(groupId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      queryClient.invalidateQueries({ queryKey: queryKeys.group(variables.groupId) });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (groupId: string) => ApiService.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
    },
  });
};

// ============================================================================
// Anonymous Chat Hooks
// ============================================================================

export const useAnonymousMessages = () => {
  return useQuery({
    queryKey: queryKeys.anonymousMessages,
    queryFn: () => ApiService.listAnonymousMessages(),
  });
};

export const useSendAnonymousMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (message: Types.AnonymousMessageCreate) => 
      ApiService.sendAnonymousMessage(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.anonymousMessages });
    },
  });
};
