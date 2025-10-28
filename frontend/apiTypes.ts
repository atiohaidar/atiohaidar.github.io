/**
 * @file API-specific types for backend communication
 */

export type UserRole = 'admin' | 'member';

export interface User {
    username: string;
    name: string;
    role: UserRole;
}

export interface UserCreate {
    username: string;
    name: string;
    password: string;
    role?: UserRole;
}

export interface UserUpdate {
    name?: string;
    password?: string;
    role?: UserRole;
}

export interface Task {
    slug: string;
    name: string;
    description?: string;
    completed: boolean;
    due_date?: string;
    owner?: string;
    created_at?: string;
    updated_at?: string;
}

export interface TaskCreate {
    slug: string;
    name: string;
    description?: string;
    completed?: boolean;
    due_date?: string;
}

export interface TaskUpdate {
    name?: string;
    description?: string;
    completed?: boolean;
    due_date?: string;
}

export interface Article {
    slug: string;
    title: string;
    content: string;
    published: boolean;
    owner?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ArticleCreate {
    slug: string;
    title: string;
    content: string;
    published?: boolean;
}

export interface ArticleUpdate {
    title?: string;
    content?: string;
    published?: boolean;
}

export interface Room {
    id: string;
    name: string;
    capacity: number;
    description?: string;
    available: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface RoomCreate {
    id: string;
    name: string;
    capacity: number;
    description?: string;
    available?: boolean;
}

export interface RoomUpdate {
    name?: string;
    capacity?: number;
    description?: string;
    available?: boolean;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Booking {
    id: string;
    room_id: string;
    user_username: string;
    start_time: string;
    end_time: string;
    status: BookingStatus;
    purpose?: string;
    created_at?: string;
    updated_at?: string;
}

export interface BookingCreate {
    room_id: string;
    start_time: string;
    end_time: string;
    purpose?: string;
}

export interface BookingUpdate {
    status: BookingStatus;
}

export interface DashboardStats {
    totalUsers?: number;
    totalTasks: number;
    completedTasks: number;
    totalArticles: number;
    publishedArticles: number;
    totalRooms?: number;
    totalBookings: number;
    pendingBookings: number;
    approvedBookings: number;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    user: User;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface UsersListResponse {
    success: boolean;
    users: User[];
}

export interface UserResponse {
    success: boolean;
    user: User;
}

export interface TasksListResponse {
    success: boolean;
    tasks: Task[];
}

export interface TaskResponse {
    success: boolean;
    task: Task;
}

export interface ArticlesListResponse {
    success: boolean;
    articles: Article[];
}

export interface ArticleResponse {
    success: boolean;
    article: Article;
}

export interface RoomsListResponse {
    success: boolean;
    data: Room[];
}

export interface RoomResponse {
    success: boolean;
    data: Room;
}

export interface BookingsListResponse {
    success: boolean;
    data: Booking[];
}

export interface BookingResponse {
    success: boolean;
    data: Booking;
}

export interface StatsResponse {
    success: boolean;
    data: DashboardStats;
}
