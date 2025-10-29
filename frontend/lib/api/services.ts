/**
 * @file Unified API service functions
 * Consolidates apiService.ts with all API endpoints
 */
import { apiFetch } from './client';
import type {
    LoginRequest,
    LoginResponse,
    User,
    UserCreate,
    UserUpdate,
    UsersListResponse,
    UserResponse,
    Task,
    TaskCreate,
    TaskUpdate,
    TasksListResponse,
    TaskResponse,
    Article,
    ArticleCreate,
    ArticleUpdate,
    ArticlesListResponse,
    ArticleResponse,
    Room,
    RoomCreate,
    RoomUpdate,
    RoomsListResponse,
    RoomResponse,
    Booking,
    BookingCreate,
    BookingUpdate,
    BookingsListResponse,
    BookingResponse,
    DashboardStats,
    StatsResponse,
    BookingStatus,
} from './types';

// ============================================================================
// Authentication API
// ============================================================================
export const authService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        return apiFetch<LoginResponse>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },
};

// ============================================================================
// Users API
// ============================================================================
export const userService = {
    list: async (): Promise<User[]> => {
        const response = await apiFetch<UsersListResponse>('/api/users');
        return response.users;
    },

    create: async (user: UserCreate): Promise<User> => {
        const response = await apiFetch<UserResponse>('/api/users', {
            method: 'POST',
            body: JSON.stringify(user),
        });
        return response.user;
    },

    update: async (username: string, updates: UserUpdate): Promise<User> => {
        const response = await apiFetch<UserResponse>(`/api/users/${username}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return response.user;
    },

    delete: async (username: string): Promise<User> => {
        const response = await apiFetch<UserResponse>(`/api/users/${username}`, {
            method: 'DELETE',
        });
        return response.user;
    },
};

// ============================================================================
// Tasks API
// ============================================================================
export const taskService = {
    list: async (params?: { page?: number; isCompleted?: boolean }): Promise<Task[]> => {
        const queryParams = new URLSearchParams();
        queryParams.append('page', (params?.page ?? 0).toString());
        if (params?.isCompleted !== undefined) {
            queryParams.append('isCompleted', params.isCompleted.toString());
        }
        
        const endpoint = `/api/tasks?${queryParams.toString()}`;
        const response = await apiFetch<TasksListResponse>(endpoint);
        return response.tasks;
    },

    get: async (slug: string): Promise<Task> => {
        const response = await apiFetch<TaskResponse>(`/api/tasks/${slug}`);
        return response.task;
    },

    create: async (task: TaskCreate): Promise<Task> => {
        const response = await apiFetch<TaskResponse>('/api/tasks', {
            method: 'POST',
            body: JSON.stringify(task),
        });
        return response.task;
    },

    delete: async (slug: string): Promise<Task> => {
        const response = await apiFetch<TaskResponse>(`/api/tasks/${slug}`, {
            method: 'DELETE',
        });
        return response.task;
    },
};

// ============================================================================
// Articles API
// ============================================================================
export const articleService = {
    list: async (params?: { page?: number; published?: boolean }): Promise<Article[]> => {
        const queryParams = new URLSearchParams();
        queryParams.append('page', (params?.page ?? 0).toString());
        if (params?.published !== undefined) {
            queryParams.append('published', params.published.toString());
        }
        
        const endpoint = `/api/articles?${queryParams.toString()}`;
        const response = await apiFetch<ArticlesListResponse>(endpoint);
        return response.articles;
    },

    get: async (slug: string): Promise<Article> => {
        const response = await apiFetch<ArticleResponse>(`/api/articles/${slug}`);
        return response.article;
    },

    create: async (article: ArticleCreate): Promise<Article> => {
        const response = await apiFetch<ArticleResponse>('/api/articles', {
            method: 'POST',
            body: JSON.stringify(article),
        });
        return response.article;
    },

    update: async (slug: string, updates: ArticleUpdate): Promise<Article> => {
        const response = await apiFetch<ArticleResponse>(`/api/articles/${slug}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return response.article;
    },

    delete: async (slug: string): Promise<Article> => {
        const response = await apiFetch<ArticleResponse>(`/api/articles/${slug}`, {
            method: 'DELETE',
        });
        return response.article;
    },
};

// ============================================================================
// Rooms API
// ============================================================================
export const roomService = {
    list: async (params?: { available?: boolean }): Promise<Room[]> => {
        const queryParams = new URLSearchParams();
        if (params?.available !== undefined) {
            queryParams.append('available', params.available.toString());
        }
        
        const endpoint = queryParams.toString() ? `/api/rooms?${queryParams.toString()}` : '/api/rooms';
        const response = await apiFetch<RoomsListResponse>(endpoint);
        return response.data;
    },

    get: async (id: string): Promise<Room> => {
        const response = await apiFetch<RoomResponse>(`/api/rooms/${id}`);
        return response.data;
    },

    create: async (room: RoomCreate): Promise<Room> => {
        const response = await apiFetch<RoomResponse>('/api/rooms', {
            method: 'POST',
            body: JSON.stringify(room),
        });
        return response.data;
    },

    update: async (id: string, updates: RoomUpdate): Promise<Room> => {
        const response = await apiFetch<RoomResponse>(`/api/rooms/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return response.data;
    },

    delete: async (id: string): Promise<Room> => {
        const response = await apiFetch<RoomResponse>(`/api/rooms/${id}`, {
            method: 'DELETE',
        });
        return response.data;
    },
};

// ============================================================================
// Bookings API
// ============================================================================
export const bookingService = {
    list: async (params?: { roomId?: string; status?: BookingStatus }): Promise<Booking[]> => {
        const queryParams = new URLSearchParams();
        if (params?.roomId) queryParams.append('roomId', params.roomId);
        if (params?.status) queryParams.append('status', params.status);
        
        const endpoint = queryParams.toString() ? `/api/bookings?${queryParams.toString()}` : '/api/bookings';
        const response = await apiFetch<BookingsListResponse>(endpoint);
        return response.data;
    },

    get: async (id: string): Promise<Booking> => {
        const response = await apiFetch<BookingResponse>(`/api/bookings/${id}`);
        return response.data;
    },

    create: async (booking: BookingCreate): Promise<Booking> => {
        const response = await apiFetch<BookingResponse>('/api/bookings', {
            method: 'POST',
            body: JSON.stringify(booking),
        });
        return response.data;
    },

    updateStatus: async (id: string, updates: BookingUpdate): Promise<Booking> => {
        const response = await apiFetch<BookingResponse>(`/api/bookings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return response.data;
    },

    cancel: async (id: string): Promise<Booking> => {
        const response = await apiFetch<BookingResponse>(`/api/bookings/${id}`, {
            method: 'DELETE',
        });
        return response.data;
    },
};

// ============================================================================
// Stats API
// ============================================================================
export const statsService = {
    get: async (): Promise<DashboardStats> => {
        const response = await apiFetch<StatsResponse>('/api/stats');
        return response.data;
    },
};

// Backwards compatibility exports - maintain old function names
export const login = authService.login;
export const listUsers = userService.list;
export const createUser = userService.create;
export const updateUser = userService.update;
export const deleteUser = userService.delete;
export const listTasks = taskService.list;
export const getTask = taskService.get;
export const createTask = taskService.create;
export const deleteTask = taskService.delete;
export const listArticles = articleService.list;
export const getArticle = articleService.get;
export const createArticle = articleService.create;
export const updateArticle = articleService.update;
export const deleteArticle = articleService.delete;
export const listRooms = roomService.list;
export const getRoom = roomService.get;
export const createRoom = roomService.create;
export const updateRoom = roomService.update;
export const deleteRoom = roomService.delete;
export const listBookings = bookingService.list;
export const getBooking = bookingService.get;
export const createBooking = bookingService.create;
export const updateBookingStatus = bookingService.updateStatus;
export const cancelBooking = bookingService.cancel;
export const getStats = statsService.get;
