import { BaseApiService } from './base';
import { Ticket, TicketCreate, TicketUpdate, TicketCategory, TicketComment, TicketAssignment, TicketAssign, TicketCommentCreate } from '@/types/api';

export class TicketsApiService extends BaseApiService {
    async listTickets(): Promise<Ticket[]> {
        const response = await this.api.get<any>('/api/tickets');
        return this.extractResult(response.data, 'tickets') ?? [];
    }

    async getTicket(id: number | string): Promise<Ticket> {
        const response = await this.api.get<any>(`/api/tickets/${id}`);
        return this.extractResult(response.data, 'ticket');
    }

    async createTicket(data: TicketCreate): Promise<Ticket> {
        const response = await this.api.post<any>('/api/public/tickets', data);
        return this.extractResult(response.data, 'ticket');
    }

    async updateTicket(id: number, data: TicketUpdate): Promise<Ticket> {
        const response = await this.api.put<any>(`/api/tickets/${id}`, data);
        return this.extractResult(response.data, 'ticket');
    }

    async deleteTicket(id: number): Promise<void> {
        await this.api.delete(`/api/tickets/${id}`);
    }

    async listTicketCategories(): Promise<TicketCategory[]> {
        const response = await this.api.get<any>('/api/tickets/categories');
        return this.extractResult(response.data, 'categories') ?? [];
    }

    async createTicketComment(ticketId: number, data: TicketCommentCreate): Promise<TicketComment> {
        const response = await this.api.post<any>(`/api/tickets/${ticketId}/comments`, data);
        return this.extractResult(response.data, 'comment');
    }

    async listTicketComments(ticketId: number, showInternal: boolean = false): Promise<TicketComment[]> {
        const response = await this.api.get<any>(`/api/tickets/${ticketId}/comments`, {
            params: { show_internal: showInternal }
        });
        return this.extractResult(response.data, 'comments') ?? [];
    }

    async listTicketAssignments(ticketId: number): Promise<TicketAssignment[]> {
        const response = await this.api.get<any>(`/api/tickets/${ticketId}/assignments`);
        return this.extractResult(response.data, 'assignments') ?? [];
    }

    async assignTicket(ticketId: number, data: TicketAssign): Promise<TicketAssignment> {
        const response = await this.api.post<any>(`/api/tickets/${ticketId}/assign`, data);
        return this.extractResult(response.data, 'assignment');
    }
}
