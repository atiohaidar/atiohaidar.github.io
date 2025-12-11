import { BaseApiService } from './base';
import * as Types from '@/types/api';

export class ChatApiService extends BaseApiService {
    // Conversations
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

    // Groups
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

    // Anonymous Chat
    async listAnonymousMessages(): Promise<Types.AnonymousMessage[]> {
        try {
            const response = await this.api.get<Types.ApiResponse<Types.AnonymousMessage[]>>(
                '/api/anonymous-messages'
            );
            return this.extractResult<Types.AnonymousMessage[]>(response.data, 'messages', 'data') ?? [];
        } catch (error) {
            this.handleError(error);
        }
    }

    async sendAnonymousMessage(message: Types.AnonymousMessageCreate): Promise<Types.AnonymousMessage> {
        try {
            const response = await this.api.post<Types.ApiResponse<Types.AnonymousMessage>>(
                '/api/anonymous-messages',
                message
            );
            const sent = this.extractResult<Types.AnonymousMessage>(response.data, 'message', 'data');
            if (sent) {
                return sent;
            }
            throw new Error('Failed to send anonymous message');
        } catch (error) {
            this.handleError(error);
        }
    }
}
