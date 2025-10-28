/**
 * @file API service functions for authentication, users, tasks, articles, rooms, bookings, and stats
 */
import { apiFetch } from './apiClient';
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
} from './apiTypes';

// Authentication
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiFetch<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
};

// Users
export const listUsers = async (): Promise<User[]> => {
    const response = await apiFetch<UsersListResponse>('/api/users');
    return response.users;
};

export const createUser = async (user: UserCreate): Promise<User> => {
    const response = await apiFetch<UserResponse>('/api/users', {
        method: 'POST',
        body: JSON.stringify(user),
    });
    return response.user;
};

export const updateUser = async (username: string, updates: UserUpdate): Promise<User> => {
    const response = await apiFetch<UserResponse>(`/api/users/${username}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
    return response.user;
};

export const deleteUser = async (username: string): Promise<User> => {
    const response = await apiFetch<UserResponse>(`/api/users/${username}`, {
        method: 'DELETE',
    });
    return response.user;
};

// Tasks
export const listTasks = async (params?: { page?: number; isCompleted?: boolean }): Promise<Task[]> => {
    const queryParams = new URLSearchParams();
    // Always include page parameter with default 0
    queryParams.append('page', (params?.page ?? 0).toString());
    if (params?.isCompleted !== undefined) queryParams.append('isCompleted', params.isCompleted.toString());
    
    const endpoint = `/api/tasks?${queryParams.toString()}`;
    const response = await apiFetch<TasksListResponse>(endpoint);
    return response.tasks;
};

export const getTask = async (slug: string): Promise<Task> => {
    const response = await apiFetch<TaskResponse>(`/api/tasks/${slug}`);
    return response.task;
};

export const createTask = async (task: TaskCreate): Promise<Task> => {
    const response = await apiFetch<TaskResponse>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
    });
    return response.task;
};

export const deleteTask = async (slug: string): Promise<Task> => {
    const response = await apiFetch<TaskResponse>(`/api/tasks/${slug}`, {
        method: 'DELETE',
    });
    return response.task;
};

// Articles
export const listArticles = async (params?: { page?: number; published?: boolean }): Promise<Article[]> => {
    const queryParams = new URLSearchParams();
    // Always include page parameter with default 0
    queryParams.append('page', (params?.page ?? 0).toString());
    if (params?.published !== undefined) queryParams.append('published', params.published.toString());
    
    const endpoint = `/api/articles?${queryParams.toString()}`;
    const response = await apiFetch<ArticlesListResponse>(endpoint);
    return response.articles;
};

export const getArticle = async (slug: string): Promise<Article> => {
    const response = await apiFetch<ArticleResponse>(`/api/articles/${slug}`);
    return response.article;
};

export const createArticle = async (article: ArticleCreate): Promise<Article> => {
    const response = await apiFetch<ArticleResponse>('/api/articles', {
        method: 'POST',
        body: JSON.stringify(article),
    });
    return response.article;
};

export const updateArticle = async (slug: string, updates: ArticleUpdate): Promise<Article> => {
    const response = await apiFetch<ArticleResponse>(`/api/articles/${slug}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
    return response.article;
};

export const deleteArticle = async (slug: string): Promise<Article> => {
    const response = await apiFetch<ArticleResponse>(`/api/articles/${slug}`, {
        method: 'DELETE',
    });
    return response.article;
};

// Rooms
export const listRooms = async (params?: { available?: boolean }): Promise<Room[]> => {
    const queryParams = new URLSearchParams();
    if (params?.available !== undefined) queryParams.append('available', params.available.toString());
    
    const endpoint = queryParams.toString() ? `/api/rooms?${queryParams.toString()}` : '/api/rooms';
    const response = await apiFetch<RoomsListResponse>(endpoint);
    return response.data;
};

export const getRoom = async (id: string): Promise<Room> => {
    const response = await apiFetch<RoomResponse>(`/api/rooms/${id}`);
    return response.data;
};

export const createRoom = async (room: RoomCreate): Promise<Room> => {
    const response = await apiFetch<RoomResponse>('/api/rooms', {
        method: 'POST',
        body: JSON.stringify(room),
    });
    return response.data;
};

export const updateRoom = async (id: string, updates: RoomUpdate): Promise<Room> => {
    const response = await apiFetch<RoomResponse>(`/api/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
    return response.data;
};

export const deleteRoom = async (id: string): Promise<Room> => {
    const response = await apiFetch<RoomResponse>(`/api/rooms/${id}`, {
        method: 'DELETE',
    });
    return response.data;
};

// Bookings
export const listBookings = async (params?: { roomId?: string; status?: BookingStatus }): Promise<Booking[]> => {
    const queryParams = new URLSearchParams();
    if (params?.roomId) queryParams.append('roomId', params.roomId);
    if (params?.status) queryParams.append('status', params.status);
    
    const endpoint = queryParams.toString() ? `/api/bookings?${queryParams.toString()}` : '/api/bookings';
    const response = await apiFetch<BookingsListResponse>(endpoint);
    return response.data;
};

export const getBooking = async (id: string): Promise<Booking> => {
    const response = await apiFetch<BookingResponse>(`/api/bookings/${id}`);
    return response.data;
};

export const createBooking = async (booking: BookingCreate): Promise<Booking> => {
    const response = await apiFetch<BookingResponse>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(booking),
    });
    return response.data;
};

export const updateBookingStatus = async (id: string, updates: BookingUpdate): Promise<Booking> => {
    const response = await apiFetch<BookingResponse>(`/api/bookings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
    return response.data;
};

export const cancelBooking = async (id: string): Promise<Booking> => {
    const response = await apiFetch<BookingResponse>(`/api/bookings/${id}`, {
        method: 'DELETE',
    });
    return response.data;
};

// Stats
export const getStats = async (): Promise<DashboardStats> => {
    const response = await apiFetch<StatsResponse>('/api/stats');
    return response.data;
};
