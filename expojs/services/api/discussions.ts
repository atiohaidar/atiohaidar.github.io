import { BaseApiService } from './base';
import { Discussion, DiscussionCreate, DiscussionWithReplies, DiscussionReply, DiscussionReplyCreate } from '@/types/api';

export class DiscussionsApiService extends BaseApiService {
    async listDiscussions(): Promise<Discussion[]> {
        const response = await this.api.get<any>('/api/discussions');
        return this.extractResult(response.data, 'discussions') ?? [];
    }

    async getDiscussion(id: string): Promise<DiscussionWithReplies> {
        const response = await this.api.get<any>(`/api/discussions/${id}`);
        return this.extractResult(response.data, 'discussion');
    }

    async createDiscussion(data: DiscussionCreate): Promise<Discussion> {
        const response = await this.api.post<any>('/api/discussions', data);
        return this.extractResult(response.data, 'discussion');
    }

    async deleteDiscussion(id: string): Promise<void> {
        await this.api.delete(`/api/discussions/${id}`);
    }

    async createDiscussionReply(discussionId: string, data: DiscussionReplyCreate): Promise<DiscussionReply> {
        const response = await this.api.post<any>(`/api/discussions/${discussionId}/replies`, data);
        return this.extractResult(response.data, 'reply');
    }
}
