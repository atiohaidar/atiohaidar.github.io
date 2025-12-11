import { BaseApiService } from './base';
import * as Types from '@/types/api';

export class BookingsApiService extends BaseApiService {
    async listBookings(): Promise<Types.Booking[]> {
        try {
            const response = await this.api.get<Types.ApiResponse<Types.Booking[]>>('/api/bookings');
            return this.extractResult<Types.Booking[]>(response.data, 'bookings', 'data') ?? [];
        } catch (error) {
            this.handleError(error);
        }
    }

    async getBooking(bookingId: string): Promise<Types.Booking> {
        try {
            const response = await this.api.get<Types.ApiResponse<Types.Booking>>(
                `/api/bookings/${bookingId}`
            );
            const booking = this.extractResult<Types.Booking>(response.data, 'booking', 'data');
            if (booking) {
                return booking;
            }
            throw new Error('Booking not found');
        } catch (error) {
            this.handleError(error);
        }
    }

    async createBooking(booking: Types.BookingCreate): Promise<Types.Booking> {
        try {
            const response = await this.api.post<Types.ApiResponse<Types.Booking>>(
                '/api/bookings',
                booking
            );
            const created = this.extractResult<Types.Booking>(response.data, 'booking', 'data');
            if (created) {
                return created;
            }
            throw new Error('Booking creation failed');
        } catch (error) {
            this.handleError(error);
        }
    }

    async updateBookingStatus(
        bookingId: string,
        updates: Types.BookingUpdate
    ): Promise<Types.Booking> {
        try {
            const response = await this.api.put<Types.ApiResponse<Types.Booking>>(
                `/api/bookings/${bookingId}`,
                updates
            );
            const updated = this.extractResult<Types.Booking>(response.data, 'booking', 'data');
            if (updated) {
                return updated;
            }
            throw new Error('Booking update failed');
        } catch (error) {
            this.handleError(error);
        }
    }

    async cancelBooking(bookingId: string): Promise<void> {
        try {
            await this.api.delete(`/api/bookings/${bookingId}`);
        } catch (error) {
            this.handleError(error);
        }
    }
}
