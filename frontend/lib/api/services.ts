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
    Form,
    FormCreate,
    FormUpdate,
    FormWithQuestions,
    FormsResponse,
    FormResponse_API,
    FormResponse,
    FormResponseCreate,
    FormResponsesResponse,
    FormResponseDetailResponse,
    Ticket,
    TicketCreate,
    TicketUpdate,
    TicketCategory,
    TicketComment,
    TicketCommentCreate,
    TicketAssignment,
    TicketAssign,
    TicketStats,
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

    get: async (id: number): Promise<Task> => {
        const response = await apiFetch<TaskResponse>(`/api/tasks/${id}`);
        return response.task;
    },

    create: async (task: TaskCreate): Promise<Task> => {
        const response = await apiFetch<TaskResponse>('/api/tasks', {
            method: 'POST',
            body: JSON.stringify(task),
        });
        return response.task;
    },

    update: async (id: number, updates: TaskUpdate): Promise<Task> => {
        const response = await apiFetch<TaskResponse>(`/api/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return response.task;
    },

    delete: async (id: number): Promise<Task> => {
        const response = await apiFetch<TaskResponse>(`/api/tasks/${id}`, {
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
export const updateTask = taskService.update;
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

// ============================================================================
// Forms API
// ============================================================================
export const formService = {
    list: async (): Promise<Form[]> => {
        const response = await apiFetch<FormsResponse>('/api/forms');
        return response.data;
    },

    get: async (formId: string): Promise<FormWithQuestions> => {
        const response = await apiFetch<FormResponse_API>(`/api/forms/${formId}`);
        return response.data;
    },

    getByToken: async (token: string): Promise<FormWithQuestions> => {
        const response = await apiFetch<FormResponse_API>(`/api/public/forms/${token}`);
        return response.data;
    },

    create: async (form: FormCreate): Promise<FormWithQuestions> => {
        const response = await apiFetch<FormResponse_API>('/api/forms', {
            method: 'POST',
            body: JSON.stringify(form),
        });
        return response.data;
    },

    update: async (formId: string, updates: FormUpdate): Promise<FormWithQuestions> => {
        const response = await apiFetch<FormResponse_API>(`/api/forms/${formId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return response.data;
    },

    delete: async (formId: string): Promise<void> => {
        await apiFetch<{ success: boolean; message: string }>(`/api/forms/${formId}`, {
            method: 'DELETE',
        });
    },

    getResponses: async (formId: string): Promise<FormResponse[]> => {
        const response = await apiFetch<FormResponsesResponse>(`/api/forms/${formId}/responses`);
        return response.data;
    },

    getResponseDetail: async (formId: string, responseId: string) => {
        const response = await apiFetch<FormResponseDetailResponse>(`/api/forms/${formId}/responses/${responseId}`);
        return response.data;
    },

    submitResponse: async (token: string, responseData: FormResponseCreate): Promise<{ success: boolean; message: string }> => {
        return apiFetch<{ success: boolean; message: string }>(`/api/public/forms/${token}/submit`, {
            method: 'POST',
            body: JSON.stringify(responseData),
        });
    },
};

export const listForms = formService.list;
export const getForm = formService.get;
export const getFormByToken = formService.getByToken;
export const createForm = formService.create;
export const updateForm = formService.update;
export const deleteForm = formService.delete;
export const getFormResponses = formService.getResponses;
export const getFormResponseDetail = formService.getResponseDetail;
export const submitFormResponse = formService.submitResponse;

// ============================================================================
// Ticket API
// ============================================================================

export const ticketService = {
    // Public endpoints (no auth required)
    submitTicket: async (ticketData: TicketCreate): Promise<{ success: boolean; ticket: Ticket; message: string }> => {
        return apiFetch<{ success: boolean; ticket: Ticket; message: string }>('/api/public/tickets', {
            method: 'POST',
            body: JSON.stringify(ticketData),
        });
    },

    getByToken: async (token: string): Promise<Ticket> => {
        const response = await apiFetch<{ success: boolean; ticket: Ticket }>(`/api/public/tickets/${token}`);
        return response.ticket;
    },

    getCommentsByToken: async (token: string): Promise<TicketComment[]> => {
        const response = await apiFetch<{ success: boolean; comments: TicketComment[] }>(`/api/public/tickets/${token}/comments`);
        return response.comments;
    },

    addCommentByToken: async (token: string, commentText: string, commenterName?: string): Promise<TicketComment> => {
        const response = await apiFetch<{ success: boolean; comment: TicketComment }>(`/api/public/tickets/${token}/comments`, {
            method: 'POST',
            body: JSON.stringify({ comment_text: commentText, commenter_name: commenterName }),
        });
        return response.comment;
    },

    // Authenticated endpoints
    listCategories: async (): Promise<TicketCategory[]> => {
        const response = await apiFetch<{ success: boolean; categories: TicketCategory[] }>('/api/tickets/categories');
        return response.categories;
    },

    list: async (params?: {
        page?: number;
        status?: string;
        categoryId?: number;
        assignedTo?: string;
        searchQuery?: string;
    }): Promise<Ticket[]> => {
        const query = new URLSearchParams();
        if (params?.page !== undefined) query.append('page', params.page.toString());
        if (params?.status) query.append('status', params.status);
        if (params?.categoryId) query.append('categoryId', params.categoryId.toString());
        if (params?.assignedTo) query.append('assignedTo', params.assignedTo);
        if (params?.searchQuery) query.append('searchQuery', params.searchQuery);

        const url = `/api/tickets${query.toString() ? `?${query.toString()}` : ''}`;
        const response = await apiFetch<{ success: boolean; tickets: Ticket[] }>(url);
        return response.tickets;
    },

    get: async (ticketId: number): Promise<Ticket> => {
        const response = await apiFetch<{ success: boolean; ticket: Ticket }>(`/api/tickets/${ticketId}`);
        return response.ticket;
    },

    update: async (ticketId: number, data: TicketUpdate): Promise<Ticket> => {
        const response = await apiFetch<{ success: boolean; ticket: Ticket }>(`/api/tickets/${ticketId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.ticket;
    },

    delete: async (ticketId: number): Promise<void> => {
        await apiFetch(`/api/tickets/${ticketId}`, {
            method: 'DELETE',
        });
    },

    getComments: async (ticketId: number, includeInternal = false): Promise<TicketComment[]> => {
        const url = `/api/tickets/${ticketId}/comments${includeInternal ? '?includeInternal=true' : ''}`;
        const response = await apiFetch<{ success: boolean; comments: TicketComment[] }>(url);
        return response.comments;
    },

    addComment: async (ticketId: number, data: TicketCommentCreate): Promise<TicketComment> => {
        const response = await apiFetch<{ success: boolean; comment: TicketComment }>(`/api/tickets/${ticketId}/comments`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.comment;
    },

    getAssignments: async (ticketId: number): Promise<TicketAssignment[]> => {
        const response = await apiFetch<{ success: boolean; assignments: TicketAssignment[] }>(`/api/tickets/${ticketId}/assignments`);
        return response.assignments;
    },

    assign: async (ticketId: number, data: TicketAssign): Promise<TicketAssignment> => {
        const response = await apiFetch<{ success: boolean; assignment: TicketAssignment }>(`/api/tickets/${ticketId}/assign`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.assignment;
    },

    getStats: async (assignedTo?: string): Promise<TicketStats> => {
        const url = `/api/tickets/stats${assignedTo ? `?assignedTo=${assignedTo}` : ''}`;
        const response = await apiFetch<{ success: boolean; stats: TicketStats }>(url);
        return response.stats;
    },
};

export const submitTicket = ticketService.submitTicket;
export const getTicketByToken = ticketService.getByToken;
export const getTicketCommentsByToken = ticketService.getCommentsByToken;
export const addTicketCommentByToken = ticketService.addCommentByToken;
export const listTicketCategories = ticketService.listCategories;
export const listTickets = ticketService.list;
export const getTicket = ticketService.get;
export const updateTicket = ticketService.update;
export const deleteTicket = ticketService.delete;
export const getTicketComments = ticketService.getComments;
export const addTicketComment = ticketService.addComment;
export const getTicketAssignments = ticketService.getAssignments;
export const assignTicket = ticketService.assign;
export const getTicketStats = ticketService.getStats;

