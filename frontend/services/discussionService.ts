import { apiFetch } from '../apiClient';

export interface Discussion {
    id: string;
    title: string;
    content: string;
    creator_username?: string;
    creator_name: string;
    is_anonymous: boolean;
    created_at: string;
    updated_at: string;
    reply_count?: number;
}

export interface DiscussionReply {
    id: string;
    discussion_id: string;
    content: string;
    creator_username?: string;
    creator_name: string;
    is_anonymous: boolean;
    created_at: string;
}

export interface DiscussionWithReplies extends Discussion {
    replies: DiscussionReply[];
}

// Discussion API
export const getDiscussions = async (): Promise<Discussion[]> => {
    const response = await apiFetch<{ discussions: Discussion[] }>('/api/discussions');
    return response.discussions;
};

export const getDiscussion = async (discussionId: string): Promise<DiscussionWithReplies> => {
    const response = await apiFetch<{ discussion: DiscussionWithReplies }>(`/api/discussions/${discussionId}`);
    return response.discussion;
};

export const createDiscussion = async (data: {
    title: string;
    content: string;
    creator_name?: string;
}): Promise<DiscussionWithReplies> => {
    const response = await apiFetch<{ discussion: DiscussionWithReplies }>('/api/discussions', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.discussion;
};

export const createReply = async (discussionId: string, data: {
    content: string;
    creator_name?: string;
}): Promise<DiscussionReply> => {
    const response = await apiFetch<{ reply: DiscussionReply }>(`/api/discussions/${discussionId}/replies`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.reply;
};

export const deleteDiscussion = async (discussionId: string): Promise<void> => {
    await apiFetch<void>(`/api/discussions/${discussionId}`, {
        method: 'DELETE',
    });
};
