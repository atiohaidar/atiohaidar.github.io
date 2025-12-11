import { BaseApiService } from './base';
import * as Types from '@/types/api';

export class TasksApiService extends BaseApiService {
    async listTasks(params?: { page?: number; isCompleted?: boolean }): Promise<Types.Task[]> {
        try {
            const response = await this.api.get<Types.ApiResponse<Types.Task[]>>('/api/tasks', {
                params: {
                    page: params?.page ?? 0,
                    isCompleted: params?.isCompleted,
                },
            });
            return this.extractResult<Types.Task[]>(response.data, 'tasks') ?? [];
        } catch (error) {
            this.handleError(error);
        }
    }

    async getTask(id: number): Promise<Types.Task> {
        try {
            const response = await this.api.get<Types.ApiResponse<Types.Task>>(`/api/tasks/${id}`);
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

    async updateTask(id: number, updates: Types.TaskUpdate): Promise<Types.Task> {
        try {
            const response = await this.api.put<Types.ApiResponse<Types.Task>>(
                `/api/tasks/${id}`,
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

    async deleteTask(id: number): Promise<void> {
        try {
            await this.api.delete(`/api/tasks/${id}`);
        } catch (error) {
            this.handleError(error);
        }
    }
}
