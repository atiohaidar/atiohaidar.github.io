import { BaseApiService } from './base';
import * as Types from '@/types/api';

export class ArticlesApiService extends BaseApiService {
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
}
