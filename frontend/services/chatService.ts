import { apiFetch } from '../apiClient';

export interface Message {
    id: string;
    conversation_id?: string;
    group_id?: string;
    sender_username: string;
    sender_name?: string;
    content: string;
    reply_to_id?: string;
    reply_content?: string;
    reply_sender_name?: string;
    created_at: string;
}

export interface Conversation {
    id: string;
    user1_username: string;
    user2_username: string;
    other_username?: string;
    other_name?: string;
    last_message?: string;
    last_message_time?: string;
    created_at: string;
    updated_at: string;
}

export interface GroupChat {
    id: string;
    name: string;
    description?: string;
    created_by: string;
    user_role?: string;
    member_count?: number;
    last_message?: string;
    last_message_time?: string;
    created_at: string;
    updated_at: string;
}

export interface GroupMember {
    group_id: string;
    user_username: string;
    name: string;
    role: 'admin' | 'member';
    joined_at: string;
}

export interface AnonymousMessage {
    id: string;
    sender_id: string;
    content: string;
    reply_to_id?: string;
    reply_content?: string;
    reply_sender_id?: string;
    created_at: string;
}

// Conversation API
export const getConversations = async (): Promise<Conversation[]> => {
    const response = await apiFetch<{ conversations: Conversation[] }>('/api/conversations');
    return response.conversations;
};

export const getOrCreateConversation = async (username: string): Promise<Conversation> => {
    const response = await apiFetch<{ conversation: Conversation }>(`/api/conversations/${username}`);
    return response.conversation;
};

export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
    const response = await apiFetch<{ messages: Message[] }>(`/api/conversations/${conversationId}/messages`);
    return response.messages;
};

// Message API
export const sendMessage = async (data: {
    conversation_id?: string;
    group_id?: string;
    content: string;
    reply_to_id?: string;
}): Promise<Message> => {
    const response = await apiFetch<{ message: Message }>('/api/messages', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.message;
};

// Group API
export const getGroups = async (): Promise<GroupChat[]> => {
    const response = await apiFetch<{ groups: GroupChat[] }>('/api/groups');
    return response.groups;
};

export const createGroup = async (data: {
    name: string;
    description?: string;
}): Promise<GroupChat> => {
    const response = await apiFetch<{ group: GroupChat }>('/api/groups', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.group;
};

export const getGroup = async (groupId: string): Promise<GroupChat> => {
    const response = await apiFetch<{ group: GroupChat }>(`/api/groups/${groupId}`);
    return response.group;
};

export const updateGroup = async (groupId: string, data: {
    name?: string;
    description?: string;
}): Promise<void> => {
    await apiFetch<void>(`/api/groups/${groupId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

export const deleteGroup = async (groupId: string): Promise<void> => {
    await apiFetch<void>(`/api/groups/${groupId}`, {
        method: 'DELETE',
    });
};

export const getGroupMessages = async (groupId: string): Promise<Message[]> => {
    const response = await apiFetch<{ messages: Message[] }>(`/api/groups/${groupId}/messages`);
    return response.messages;
};

export const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
    const response = await apiFetch<{ members: GroupMember[] }>(`/api/groups/${groupId}/members`);
    return response.members;
};

export const addGroupMember = async (groupId: string, data: {
    user_username: string;
    role?: 'admin' | 'member';
}): Promise<void> => {
    await apiFetch<void>(`/api/groups/${groupId}/members`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const removeGroupMember = async (groupId: string, username: string): Promise<void> => {
    await apiFetch<void>(`/api/groups/${groupId}/members/${username}`, {
        method: 'DELETE',
    });
};

export const updateMemberRole = async (groupId: string, username: string, role: 'admin' | 'member'): Promise<void> => {
    await apiFetch<void>(`/api/groups/${groupId}/members/${username}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
    });
};

// Anonymous Chat API
export const getAnonymousMessages = async (): Promise<AnonymousMessage[]> => {
    const response = await apiFetch<{ messages: AnonymousMessage[] }>('/api/anonymous/messages');
    return response.messages;
};

export const sendAnonymousMessage = async (data: {
    sender_id: string;
    content: string;
    reply_to_id?: string;
}): Promise<AnonymousMessage> => {
    const response = await apiFetch<{ message: AnonymousMessage }>('/api/anonymous/messages', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.message;
};

export const deleteAllAnonymousMessages = async (): Promise<void> => {
    await apiFetch<void>('/api/anonymous/messages', {
        method: 'DELETE',
    });
};
