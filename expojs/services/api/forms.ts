import { BaseApiService } from './base';
import { Form, FormWithQuestions, FormCreate, FormUpdate, FormResponse, FormResponseDetail, FormResponseCreate } from '@/types/api';

export class FormsApiService extends BaseApiService {
    async listForms(): Promise<Form[]> {
        const response = await this.api.get<any>('/api/forms');
        return this.extractResult(response.data, 'forms') ?? [];
    }

    async getForm(id: string): Promise<FormWithQuestions> {
        const response = await this.api.get<any>(`/api/forms/${id}`);
        return this.extractResult(response.data, 'form');
    }

    async getFormByToken(token: string): Promise<FormWithQuestions> {
        const response = await this.api.get<any>(`/api/public/forms/${token}`);
        return this.extractResult(response.data, 'form');
    }

    async createForm(data: FormCreate): Promise<Form> {
        const response = await this.api.post<any>('/api/forms', data);
        return this.extractResult(response.data, 'form');
    }

    async updateForm(id: string, data: FormUpdate): Promise<Form> {
        const response = await this.api.put<any>(`/api/forms/${id}`, data);
        return this.extractResult(response.data, 'form');
    }

    async deleteForm(id: string): Promise<void> {
        await this.api.delete(`/api/forms/${id}`);
    }

    async listFormResponses(formId: string): Promise<FormResponse[]> {
        const response = await this.api.get<any>(`/api/forms/${formId}/responses`);
        return this.extractResult(response.data, 'responses') ?? [];
    }

    async getFormResponseDetail(formId: string, responseId: string): Promise<FormResponseDetail> {
        const response = await this.api.get<any>(`/api/forms/${formId}/responses/${responseId}`);
        return this.extractResult(response.data, 'response');
    }

    async submitFormResponse(token: string, data: FormResponseCreate): Promise<FormResponse> {
        const response = await this.api.post<any>(`/api/public/forms/${token}/submit`, data);
        return this.extractResult(response.data, 'response');
    }
}
