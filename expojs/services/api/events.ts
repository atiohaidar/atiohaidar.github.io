import { BaseApiService } from './base';
import { Event, EventCreate, EventUpdate, EventAttendee, EventAdmin, AttendanceScan, AttendanceScanCreate, ScanResponse, EventScanHistory, EventAttendeeUpdateStatus } from '@/types/api';

export class EventsApiService extends BaseApiService {
    async listEvents(): Promise<Event[]> {
        const response = await this.api.get<any>('/api/events');
        return this.extractResult(response.data, 'events') ?? [];
    }

    async getEvent(id: string): Promise<Event> {
        const response = await this.api.get<any>(`/api/events/${id}`);
        return this.extractResult(response.data, 'event');
    }

    async createEvent(data: EventCreate): Promise<Event> {
        const response = await this.api.post<any>('/api/events', data);
        return this.extractResult(response.data, 'event');
    }

    async updateEvent(id: string, data: EventUpdate): Promise<Event> {
        const response = await this.api.put<any>(`/api/events/${id}`, data);
        return this.extractResult(response.data, 'event');
    }

    async deleteEvent(id: string): Promise<void> {
        await this.api.delete(`/api/events/${id}`);
    }

    // Attendees
    async listEventAttendees(eventId: string): Promise<EventAttendee[]> {
        const response = await this.api.get<any>(`/api/events/${eventId}/attendees`);
        return this.extractResult(response.data, 'attendees') ?? [];
    }

    async registerForEvent(eventId: string): Promise<EventAttendee> {
        const response = await this.api.post<any>(`/api/events/register`, { event_id: eventId });
        return this.extractResult(response.data, 'attendee');
    }

    async unregisterFromEvent(eventId: string, attendeeId: string): Promise<void> {
        await this.api.delete(`/api/events/${eventId}/attendees/${attendeeId}`);
    }

    async updateAttendeeStatus(eventId: string, attendeeId: string, data: EventAttendeeUpdateStatus): Promise<EventAttendee> {
        const response = await this.api.put<any>(`/api/events/${eventId}/attendees/${attendeeId}/status`, data);
        return this.extractResult(response.data, 'attendee');
    }

    // Admins
    async listEventAdmins(eventId: string): Promise<EventAdmin[]> {
        const response = await this.api.get<any>(`/api/events/${eventId}/admins`);
        return this.extractResult(response.data, 'admins') ?? [];
    }

    async addEventAdmin(eventId: string, username: string): Promise<EventAdmin> {
        const response = await this.api.post<any>(`/api/events/${eventId}/admins`, { user_username: username });
        return this.extractResult(response.data, 'admin');
    }

    async removeEventAdmin(eventId: string, username: string): Promise<void> {
        await this.api.delete(`/api/events/${eventId}/admins/${username}`);
    }

    // Scanning
    async scanAttendance(eventId: string, data: AttendanceScanCreate): Promise<ScanResponse> {
        const response = await this.api.post<any>(`/api/events/${eventId}/scan`, data);
        return this.extractResult(response.data, 'attendee', 'scan');
    }

    async getEventScanHistory(eventId: string): Promise<EventScanHistory[]> {
        const response = await this.api.get<any>(`/api/events/${eventId}/scan-history`);
        return this.extractResult(response.data, 'history', 'scans') ?? [];
    }
}
