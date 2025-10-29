import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Types from '@/types/api';

// Configure the base URL for your API
// You can override this via EXPO_PUBLIC_API_BASE_URL for physical devices/other hosts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://backend.atiohaidar.workers.dev';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      async (config) => {
        if (!this.token) {
          this.token = await AsyncStorage.getItem('authToken');
        }
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear storage
          await this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  private extractResult<T>(response: Types.ApiResponse<T> | Record<string, unknown>, ...fallbackKeys: string[]): T {
    const candidate = (response as Types.ApiResponse<T>).result ?? (response as Types.ApiResponse<T>).data;
    if (candidate !== undefined) {
      return candidate;
    }

    for (const key of fallbackKeys) {
      if (key in response) {
        return (response as Record<string, unknown>)[key] as T;
      }
    }

    return undefined as unknown as T;
  }

  // Helper method to handle API errors
  private handleError(error: any): never {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('An unexpected error occurred');
    }
  }

  // Auth APIs
  async login(credentials: Types.LoginRequest): Promise<Types.LoginResponse> {
    try {
      const response = await this.api.post<Types.ApiResponse<Types.LoginResponse>>(
        '/api/auth/login',
        credentials
      );
      let payload = this.extractResult<Types.LoginResponse>(response.data, 'data');

      if (!payload?.token || !payload?.user) {
        const raw = response.data as unknown as Record<string, unknown>;
        const token = raw.token as string | undefined;
        const user = raw.user as Types.User | undefined;
        if (token && user) {
          payload = { token, user };
        }
      }

      if (payload?.token && payload?.user) {
        this.token = payload.token;
        await AsyncStorage.setItem('authToken', this.token);
        await AsyncStorage.setItem('currentUser', JSON.stringify(payload.user));
        return payload;
      }

      throw new Error('Login failed');
    } catch (error) {
      this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    this.token = null;
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('currentUser');
  }

  async getCurrentUser(): Promise<Types.User | null> {
    const userStr = await AsyncStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Stats API
  async getStats(): Promise<Types.DashboardStats> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.DashboardStats>>('/api/stats');
      return this.extractResult<Types.DashboardStats>(response.data, 'stats') ?? {};
    } catch (error) {
      this.handleError(error);
    }
  }

  // User APIs
  async listUsers(): Promise<Types.User[]> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.User[]>>('/api/users');
      return this.extractResult<Types.User[]>(response.data, 'users') ?? [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUser(username: string): Promise<Types.User> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.User>>(`/api/users/${username}`);
      const user = this.extractResult<Types.User>(response.data, 'user');
      if (user) {
        return user;
      }
      throw new Error('User not found');
    } catch (error) {
      this.handleError(error);
    }
  }

  async createUser(user: Types.UserCreate): Promise<Types.User> {
    try {
      const response = await this.api.post<Types.ApiResponse<Types.User>>('/api/users', user);
      const created = this.extractResult<Types.User>(response.data, 'user');
      if (created) {
        return created;
      }
      throw new Error('User creation failed');
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateUser(username: string, updates: Types.UserUpdate): Promise<Types.User> {
    try {
      const response = await this.api.put<Types.ApiResponse<Types.User>>(
        `/api/users/${username}`,
        updates
      );
      const updated = this.extractResult<Types.User>(response.data, 'user');
      if (updated) {
        return updated;
      }
      throw new Error('User update failed');
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateSelfProfile(updates: Types.UserUpdate): Promise<Types.User> {
    try {
      const response = await this.api.put<Types.ApiResponse<Types.User>>(
        '/api/profile',
        updates
      );
      const updated = this.extractResult<Types.User>(response.data, 'user');
      if (updated) {
        // Update the cached user data
        await AsyncStorage.setItem('currentUser', JSON.stringify(updated));
        return updated;
      }
      throw new Error('Profile update failed');
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteUser(username: string): Promise<void> {
    try {
      await this.api.delete(`/api/users/${username}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Task APIs
  async listTasks(): Promise<Types.Task[]> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Task[]>>('/api/tasks');
      return this.extractResult<Types.Task[]>(response.data, 'tasks') ?? [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTask(slug: string): Promise<Types.Task> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Task>>(`/api/tasks/${slug}`);
      const task = this.extractResult<Types.Task>(response.data, 'task');
      if (task) {
        return task;
      }
      throw new Error('Task not found');
    } catch (error) {
      this.handleError(error);
    }
  }

  async createTask(task: Types.TaskCreate): Promise<Types.Task> {
    try {
      const response = await this.api.post<Types.ApiResponse<Types.Task>>('/api/tasks', task);
      const created = this.extractResult<Types.Task>(response.data, 'task');
      if (created) {
        return created;
      }
      throw new Error('Task creation failed');
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateTask(slug: string, updates: Types.TaskUpdate): Promise<Types.Task> {
    try {
      const response = await this.api.put<Types.ApiResponse<Types.Task>>(
        `/api/tasks/${slug}`,
        updates
      );
      const updated = this.extractResult<Types.Task>(response.data, 'task');
      if (updated) {
        return updated;
      }
      throw new Error('Task update failed');
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteTask(slug: string): Promise<void> {
    try {
      await this.api.delete(`/api/tasks/${slug}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Article APIs
  async listArticles(): Promise<Types.Article[]> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Article[]>>('/api/articles');
      return this.extractResult<Types.Article[]>(response.data, 'articles') ?? [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async listPublicArticles(): Promise<Types.Article[]> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Article[]>>('/api/public/articles');
      return this.extractResult<Types.Article[]>(response.data, 'articles') ?? [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPublicArticle(slug: string): Promise<Types.Article> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Article>>(
        `/api/public/articles/${slug}`
      );
      const article = this.extractResult<Types.Article>(response.data, 'article');
      if (article) {
        return article;
      }
      throw new Error('Article not found');
    } catch (error) {
      this.handleError(error);
    }
  }

  async getArticle(slug: string): Promise<Types.Article> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Article>>(
        `/api/articles/${slug}`
      );
      const article = this.extractResult<Types.Article>(response.data, 'article');
      if (article) {
        return article;
      }
      throw new Error('Article not found');
    } catch (error) {
      this.handleError(error);
    }
  }

  async createArticle(article: Types.ArticleCreate): Promise<Types.Article> {
    try {
      const response = await this.api.post<Types.ApiResponse<Types.Article>>(
        '/api/articles',
        article
      );
      const created = this.extractResult<Types.Article>(response.data, 'article');
      if (created) {
        return created;
      }
      throw new Error('Article creation failed');
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateArticle(slug: string, updates: Types.ArticleUpdate): Promise<Types.Article> {
    try {
      const response = await this.api.put<Types.ApiResponse<Types.Article>>(
        `/api/articles/${slug}`,
        updates
      );
      const updated = this.extractResult<Types.Article>(response.data, 'article');
      if (updated) {
        return updated;
      }
      throw new Error('Article update failed');
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteArticle(slug: string): Promise<void> {
    try {
      await this.api.delete(`/api/articles/${slug}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Room APIs
  async listRooms(available?: boolean): Promise<Types.Room[]> {
    try {
      const params = available !== undefined ? { available } : {};
      const response = await this.api.get<Types.ApiResponse<Types.Room[]>>('/api/rooms', {
        params,
      });
      return this.extractResult<Types.Room[]>(response.data, 'rooms', 'data') ?? [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getRoom(roomId: string): Promise<Types.Room> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Room>>(`/api/rooms/${roomId}`);
      const room = this.extractResult<Types.Room>(response.data, 'room', 'data');
      if (room) {
        return room;
      }
      throw new Error('Room not found');
    } catch (error) {
      this.handleError(error);
    }
  }

  async createRoom(room: Types.RoomCreate): Promise<Types.Room> {
    try {
      const response = await this.api.post<Types.ApiResponse<Types.Room>>('/api/rooms', room);
      const created = this.extractResult<Types.Room>(response.data, 'room', 'data');
      if (created) {
        return created;
      }
      throw new Error('Room creation failed');
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateRoom(roomId: string, updates: Types.RoomUpdate): Promise<Types.Room> {
    try {
      const response = await this.api.put<Types.ApiResponse<Types.Room>>(
        `/api/rooms/${roomId}`,
        updates
      );
      const updated = this.extractResult<Types.Room>(response.data, 'room', 'data');
      if (updated) {
        return updated;
      }
      throw new Error('Room update failed');
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteRoom(roomId: string): Promise<void> {
    try {
      await this.api.delete(`/api/rooms/${roomId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Booking APIs
  async listBookings(): Promise<Types.Booking[]> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Booking[]>>('/api/bookings');
      return this.extractResult<Types.Booking[]>(response.data, 'bookings', 'data') ?? [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getBooking(bookingId: string): Promise<Types.Booking> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Booking>>(
        `/api/bookings/${bookingId}`
      );
      const booking = this.extractResult<Types.Booking>(response.data, 'booking', 'data');
      if (booking) {
        return booking;
      }
      throw new Error('Booking not found');
    } catch (error) {
      this.handleError(error);
    }
  }

  async createBooking(booking: Types.BookingCreate): Promise<Types.Booking> {
    try {
      const response = await this.api.post<Types.ApiResponse<Types.Booking>>(
        '/api/bookings',
        booking
      );
      const created = this.extractResult<Types.Booking>(response.data, 'booking', 'data');
      if (created) {
        return created;
      }
      throw new Error('Booking creation failed');
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateBookingStatus(
    bookingId: string,
    updates: Types.BookingUpdate
  ): Promise<Types.Booking> {
    try {
      const response = await this.api.put<Types.ApiResponse<Types.Booking>>(
        `/api/bookings/${bookingId}`,
        updates
      );
      const updated = this.extractResult<Types.Booking>(response.data, 'booking', 'data');
      if (updated) {
        return updated;
      }
      throw new Error('Booking update failed');
    } catch (error) {
      this.handleError(error);
    }
  }

  async cancelBooking(bookingId: string): Promise<void> {
    try {
      await this.api.delete(`/api/bookings/${bookingId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Chat APIs - Conversations
  async listConversations(): Promise<Types.Conversation[]> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Conversation[]>>(
        '/api/conversations'
      );
      return this.extractResult<Types.Conversation[]>(response.data, 'conversations', 'data') ?? [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getOrCreateConversation(username: string): Promise<Types.Conversation> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Conversation>>(
        `/api/conversations/${username}`
      );
      const conversation = this.extractResult<Types.Conversation>(response.data, 'conversation', 'data');
      if (conversation) {
        return conversation;
      }
      throw new Error('Failed to get conversation');
    } catch (error) {
      this.handleError(error);
    }
  }

  async getConversationMessages(conversationId: string): Promise<Types.Message[]> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Message[]>>(
        `/api/conversations/${conversationId}/messages`
      );
      return this.extractResult<Types.Message[]>(response.data, 'messages', 'data') ?? [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async sendMessage(message: Types.MessageCreate): Promise<Types.Message> {
    try {
      const response = await this.api.post<Types.ApiResponse<Types.Message>>(
        '/api/messages',
        message
      );
      const sent = this.extractResult<Types.Message>(response.data, 'message', 'data');
      if (sent) {
        return sent;
      }
      throw new Error('Failed to send message');
    } catch (error) {
      this.handleError(error);
    }
  }

  // Group Chat APIs
  async listGroups(): Promise<Types.GroupChat[]> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.GroupChat[]>>('/api/groups');
      return this.extractResult<Types.GroupChat[]>(response.data, 'groups', 'data') ?? [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getGroup(groupId: string): Promise<Types.GroupChat> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.GroupChat>>(
        `/api/groups/${groupId}`
      );
      const group = this.extractResult<Types.GroupChat>(response.data, 'group', 'data');
      if (group) {
        return group;
      }
      throw new Error('Group not found');
    } catch (error) {
      this.handleError(error);
    }
  }

  async createGroup(group: Types.GroupChatCreate): Promise<Types.GroupChat> {
    try {
      const response = await this.api.post<Types.ApiResponse<Types.GroupChat>>(
        '/api/groups',
        group
      );
      const created = this.extractResult<Types.GroupChat>(response.data, 'group', 'data');
      if (created) {
        return created;
      }
      throw new Error('Group creation failed');
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateGroup(groupId: string, updates: Types.GroupChatUpdate): Promise<Types.GroupChat> {
    try {
      const response = await this.api.put<Types.ApiResponse<Types.GroupChat>>(
        `/api/groups/${groupId}`,
        updates
      );
      const updated = this.extractResult<Types.GroupChat>(response.data, 'group', 'data');
      if (updated) {
        return updated;
      }
      throw new Error('Group update failed');
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      await this.api.delete(`/api/groups/${groupId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getGroupMessages(groupId: string): Promise<Types.Message[]> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Message[]>>(
        `/api/groups/${groupId}/messages`
      );
      return this.extractResult<Types.Message[]>(response.data, 'messages', 'data') ?? [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getGroupMembers(groupId: string): Promise<Types.GroupMember[]> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.GroupMember[]>>(
        `/api/groups/${groupId}/members`
      );
      return this.extractResult<Types.GroupMember[]>(response.data, 'members', 'data') ?? [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async addGroupMember(groupId: string, member: Types.GroupMemberAdd): Promise<void> {
    try {
      await this.api.post(`/api/groups/${groupId}/members`, member);
    } catch (error) {
      this.handleError(error);
    }
  }

  async removeGroupMember(groupId: string, username: string): Promise<void> {
    try {
      await this.api.delete(`/api/groups/${groupId}/members/${username}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateGroupMemberRole(
    groupId: string,
    username: string,
    role: Types.GroupMemberRole
  ): Promise<void> {
    try {
      await this.api.put(`/api/groups/${groupId}/members/${username}/role`, { role });
    } catch (error) {
      this.handleError(error);
    }
  }

  // Anonymous Chat APIs
  async listAnonymousMessages(): Promise<Types.AnonymousMessage[]> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.AnonymousMessage[]>>(
        '/api/anonymous/messages'
      );
      return this.extractResult<Types.AnonymousMessage[]>(response.data, 'messages', 'data') ?? [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async sendAnonymousMessage(
    message: Types.AnonymousMessageCreate
  ): Promise<Types.AnonymousMessage> {
    try {
      const response = await this.api.post<Types.ApiResponse<Types.AnonymousMessage>>(
        '/api/anonymous/messages',
        message
      );
      const created = this.extractResult<Types.AnonymousMessage>(response.data, 'message', 'data');
      if (created) {
        return created;
      }
      throw new Error('Failed to send anonymous message');
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Export a singleton instance
export default new ApiService();
