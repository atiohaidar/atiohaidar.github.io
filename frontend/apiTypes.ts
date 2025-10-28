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
