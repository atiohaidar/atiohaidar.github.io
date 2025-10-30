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
  created_at: string;
  reply_content?: string;
  reply_sender_id?: string;
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

// Form types
export interface FormQuestion {
  id: string;
  form_id: string;
  question_text: string;
  question_order: number;
  created_at?: string;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  token: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface FormWithQuestions {
  form: Form;
  questions: FormQuestion[];
}

export interface FormCreate {
  title: string;
  description?: string;
  questions: {
    question_text: string;
    question_order: number;
  }[];
}

export interface FormUpdate {
  title?: string;
  description?: string;
  questions?: {
    id?: string;
    question_text: string;
    question_order: number;
  }[];
}

export interface FormResponse {
  id: string;
  form_id: string;
  respondent_name?: string;
  submitted_at?: string;
}

export interface FormAnswer {
  question_id: string;
  question_text: string;
  answer_text: string;
}

export interface FormResponseDetail {
  response: FormResponse;
  answers: FormAnswer[];
}

export interface FormResponseCreate {
  respondent_name?: string;
  answers: {
    question_id: string;
    answer_text: string;
  }[];
}

// Item types
export interface Item {
  id: string;
  name: string;
  description?: string;
  stock: number;
  attachment_link?: string;
  owner_username: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItemCreate {
  name: string;
  description?: string;
  stock: number;
  attachment_link?: string;
}

export interface ItemUpdate {
  name?: string;
  description?: string;
  stock?: number;
  attachment_link?: string;
}

// Item Borrowing types
export type ItemBorrowingStatus = 'pending' | 'approved' | 'rejected' | 'returned' | 'damaged' | 'extended';

export interface ItemBorrowing {
  id: string;
  item_id: string;
  borrower_username: string;
  quantity: number;
  start_date: string;
  end_date: string;
  status: ItemBorrowingStatus;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItemBorrowingCreate {
  item_id: string;
  quantity: number;
  start_date: string;
  end_date: string;
  notes?: string;
}

export interface ItemBorrowingUpdateStatus {
  status: ItemBorrowingStatus;
  notes?: string;
}

// Ticket Types
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'solved';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type CommenterType = 'guest' | 'user';

export interface TicketCategory {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Ticket {
  id: number;
  token: string;
  title: string;
  description: string;
  category_id: number;
  category_name?: string;
  status: TicketStatus;
  priority: TicketPriority;
  submitter_name?: string;
  submitter_email?: string;
  reference_link?: string;
  assigned_to?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TicketCreate {
  title: string;
  description: string;
  category_id: number;
  priority?: TicketPriority;
  submitter_name?: string;
  submitter_email?: string;
  reference_link?: string;
}

export interface TicketUpdate {
  title?: string;
  description?: string;
  category_id?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: string;
}

export interface TicketComment {
  id: number;
  ticket_id: number;
  commenter_type: CommenterType;
  commenter_name: string;
  comment_text: string;
  is_internal: boolean;
  created_at?: string;
}

export interface TicketCommentCreate {
  comment_text: string;
  is_internal?: boolean;
}

export interface TicketCommentCreateByToken {
  comment_text: string;
  commenter_name?: string;
}

export interface TicketAssignment {
  id: number;
  ticket_id: number;
  assigned_from?: string;
  assigned_to: string;
  assigned_by: string;
  notes?: string;
  created_at?: string;
}

export interface TicketAssign {
  assigned_to: string;
  notes?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  waiting: number;
  solved: number;
}

// Discussion types
export interface Discussion {
  id: string;
  title: string;
  content: string;
  creator_username?: string;
  creator_name: string;
  reply_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface DiscussionReply {
  id: string;
  discussion_id: string;
  content: string;
  creator_username?: string;
  creator_name: string;
  created_at?: string;
}

export interface DiscussionCreate {
  title: string;
  content: string;
  creator_name?: string;
}

export interface DiscussionReplyCreate {
  content: string;
  creator_name?: string;
}

export interface DiscussionWithReplies extends Discussion {
  replies: DiscussionReply[];
}

// Event types
export type AttendeeStatus = 'registered' | 'present' | 'absent';

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string; // ISO 8601 datetime
  location?: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventCreate {
  title: string;
  description?: string;
  event_date: string; // ISO 8601 datetime
  location?: string;
}

export interface EventUpdate {
  title?: string;
  description?: string;
  event_date?: string;
  location?: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_username: string;
  attendance_token: string;
  status: AttendeeStatus;
  registered_at?: string;
}

export interface EventAttendeeRegister {
  event_id: string;
}

export interface EventAttendeeUpdateStatus {
  status: AttendeeStatus;
}

export interface EventAdmin {
  id: string;
  event_id: string;
  user_username: string;
  assigned_by: string;
  assigned_at?: string;
}

export interface EventAdminAssign {
  user_username: string;
}

export interface AttendanceScan {
  id: string;
  attendee_id: string;
  scanned_by: string;
  scanned_at?: string;
  latitude?: number;
  longitude?: number;
}

export interface AttendanceScanCreate {
  attendance_token: string;
  latitude?: number;
  longitude?: number;
}

export interface AttendeeWithScans {
  attendee: EventAttendee;
  scans: AttendanceScan[];
}

export interface EventScanHistory {
  id: string;
  attendee_id: string;
  attendee_username: string;
  attendee_status: string;
  scanned_by: string;
  scanned_at: string;
  latitude?: number;
  longitude?: number;
}

export interface ScanResponse {
  attendee: EventAttendee;
  isFirstScan: boolean;
}
