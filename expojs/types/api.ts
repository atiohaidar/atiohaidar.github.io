// API Types for Mobile App
// These types match the backend API schemas

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

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Task {
  id: number;
  name: string;
  description?: string;
  completed: boolean;
  due_date?: string;
  owner?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaskCreate {
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
  title: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BookingCreate {
  room_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
}

export interface BookingUpdate {
  status: BookingStatus;
}

export interface Message {
  id: string;
  conversation_id?: string;
  group_id?: string;
  sender_username: string;
  content: string;
  reply_to_id?: string;
  created_at?: string;
}

export interface MessageCreate {
  conversation_id?: string;
  group_id?: string;
  content: string;
  reply_to_id?: string;
}

export interface Conversation {
  id: string;
  user1_username: string;
  user2_username: string;
  created_at?: string;
  updated_at?: string;
}

export type GroupMemberRole = 'admin' | 'member';

export interface GroupChat {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface GroupChatCreate {
  name: string;
  description?: string;
}

export interface GroupChatUpdate {
  name?: string;
  description?: string;
}

export interface GroupMember {
  group_id: string;
  user_username: string;
  role: GroupMemberRole;
  joined_at?: string;
}

export interface GroupMemberAdd {
  user_username: string;
  role?: GroupMemberRole;
}

export interface AnonymousMessage {
  id: string;
  sender_id: string;
  content: string;
  reply_to_id?: string;
  created_at?: string;
}

export interface AnonymousMessageCreate {
  sender_id: string;
  content: string;
  reply_to_id?: string;
}

export interface DashboardStats {
  totalUsers?: number;
  totalTasks?: number;
  completedTasks?: number;
  totalArticles?: number;
  publishedArticles?: number;
  totalRooms?: number;
  totalBookings?: number;
  pendingBookings?: number;
  approvedBookings?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  result?: T;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ message: string }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  result: {
    data: T[];
    page: number;
    perPage: number;
    total: number;
  };
}
