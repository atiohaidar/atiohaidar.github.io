import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Types from '@/types/api';

// Configure the base URL for your API
// You can change this to your actual backend URL
const API_BASE_URL = 'https://api.atiohaidar.workers.dev'; // Update this with your actual API URL

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
      if (response.data.result) {
        this.token = response.data.result.token;
        await AsyncStorage.setItem('authToken', this.token);
        await AsyncStorage.setItem('currentUser', JSON.stringify(response.data.result.user));
        return response.data.result;
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
      return response.data.result || {};
    } catch (error) {
      this.handleError(error);
    }
  }

  // User APIs
  async listUsers(): Promise<Types.User[]> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.User[]>>('/api/users');
      return response.data.result || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUser(username: string): Promise<Types.User> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.User>>(`/api/users/${username}`);
      if (response.data.result) {
        return response.data.result;
      }
      throw new Error('User not found');
    } catch (error) {
      this.handleError(error);
    }
  }

  async createUser(user: Types.UserCreate): Promise<Types.User> {
    try {
      const response = await this.api.post<Types.ApiResponse<Types.User>>('/api/users', user);
      if (response.data.result) {
        return response.data.result;
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
      if (response.data.result) {
        return response.data.result;
      }
      throw new Error('User update failed');
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
      return response.data.result || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTask(slug: string): Promise<Types.Task> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Task>>(`/api/tasks/${slug}`);
      if (response.data.result) {
        return response.data.result;
      }
      throw new Error('Task not found');
    } catch (error) {
      this.handleError(error);
    }
  }

  async createTask(task: Types.TaskCreate): Promise<Types.Task> {
    try {
      const response = await this.api.post<Types.ApiResponse<Types.Task>>('/api/tasks', task);
      if (response.data.result) {
        return response.data.result;
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
      if (response.data.result) {
        return response.data.result;
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
      return response.data.result || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getArticle(slug: string): Promise<Types.Article> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Article>>(
        `/api/articles/${slug}`
      );
      if (response.data.result) {
        return response.data.result;
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
      if (response.data.result) {
        return response.data.result;
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
      if (response.data.result) {
        return response.data.result;
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
      return response.data.result || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getRoom(roomId: string): Promise<Types.Room> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Room>>(`/api/rooms/${roomId}`);
      if (response.data.result) {
        return response.data.result;
      }
      throw new Error('Room not found');
    } catch (error) {
      this.handleError(error);
    }
  }

  async createRoom(room: Types.RoomCreate): Promise<Types.Room> {
    try {
      const response = await this.api.post<Types.ApiResponse<Types.Room>>('/api/rooms', room);
      if (response.data.result) {
        return response.data.result;
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
      if (response.data.result) {
        return response.data.result;
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
      return response.data.result || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getBooking(bookingId: string): Promise<Types.Booking> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Booking>>(
        `/api/bookings/${bookingId}`
      );
      if (response.data.result) {
        return response.data.result;
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
      if (response.data.result) {
        return response.data.result;
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
      if (response.data.result) {
        return response.data.result;
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
      return response.data.result || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getOrCreateConversation(username: string): Promise<Types.Conversation> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.Conversation>>(
        `/api/conversations/${username}`
      );
      if (response.data.result) {
        return response.data.result;
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
      return response.data.result || [];
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
      if (response.data.result) {
        return response.data.result;
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
      return response.data.result || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getGroup(groupId: string): Promise<Types.GroupChat> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.GroupChat>>(
        `/api/groups/${groupId}`
      );
      if (response.data.result) {
        return response.data.result;
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
      if (response.data.result) {
        return response.data.result;
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
      if (response.data.result) {
        return response.data.result;
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
      return response.data.result || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getGroupMembers(groupId: string): Promise<Types.GroupMember[]> {
    try {
      const response = await this.api.get<Types.ApiResponse<Types.GroupMember[]>>(
        `/api/groups/${groupId}/members`
      );
      return response.data.result || [];
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
      return response.data.result || [];
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
      if (response.data.result) {
        return response.data.result;
      }
      throw new Error('Failed to send anonymous message');
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Export a singleton instance
export default new ApiService();
