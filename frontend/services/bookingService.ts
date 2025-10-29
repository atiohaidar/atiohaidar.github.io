import { apiFetch } from '../apiClient';
import type { Booking, BookingCreate, BookingUpdate, BookingListResponse, BookingResponse } from '../types/booking';

export const bookingService = {
  // Get all bookings
  async getBookings(roomId?: string, status?: string): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (roomId) params.append('roomId', roomId);
    if (status) params.append('status', status);
    
    const query = params.toString();
    const response = await apiFetch<BookingListResponse>(`/api/bookings${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Get single booking
  async getBooking(bookingId: string): Promise<Booking> {
    const response = await apiFetch<BookingResponse>(`/api/bookings/${bookingId}`);
    return response.data;
  },

  // Create booking
  async createBooking(bookingData: BookingCreate): Promise<Booking> {
    const response = await apiFetch<BookingResponse>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
    return response.data;
  },

  // Update booking status (admin only)
  async updateBookingStatus(bookingId: string, status: { status: string }): Promise<Booking> {
    const response = await apiFetch<BookingResponse>(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(status)
    });
    return response.data;
  },

  // Update booking details (owner or admin)
  async updateBooking(bookingId: string, bookingData: BookingCreate): Promise<Booking> {
    const response = await apiFetch<BookingResponse>(`/api/bookings/${bookingId}/edit`, {
      method: 'PUT',
      body: JSON.stringify(bookingData)
    });
    return response.data;
  },

  // Cancel booking
  async cancelBooking(bookingId: string): Promise<Booking> {
    const response = await apiFetch<BookingResponse>(`/api/bookings/${bookingId}`, {
      method: 'DELETE'
    });
    return response.data;
  }
};
