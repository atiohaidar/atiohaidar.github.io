import { BaseApiService } from './base';
import * as Types from '@/types/api';

export class RoomsApiService extends BaseApiService {
    async listRooms(available?: boolean): Promise<Types.Room[]> {
        try {
            const params = available !== undefined ? { available } : {};
            const response = await this.api.get<Types.ApiResponse<Types.Room[]>>('/api/rooms', {
                params,
            });
            return this.extractResult<Types.Room[]>(response.data, 'rooms', 'data') ?? [];
        } catch (error) {
            this.handleError(error);
        }
    }

    async getRoom(roomId: string): Promise<Types.Room> {
        try {
            const response = await this.api.get<Types.ApiResponse<Types.Room>>(`/api/rooms/${roomId}`);
            const room = this.extractResult<Types.Room>(response.data, 'room', 'data');
            if (room) {
                return room;
            }
            throw new Error('Room not found');
        } catch (error) {
            this.handleError(error);
        }
    }

    async createRoom(room: Types.RoomCreate): Promise<Types.Room> {
        try {
            const response = await this.api.post<Types.ApiResponse<Types.Room>>('/api/rooms', room);
            const created = this.extractResult<Types.Room>(response.data, 'room', 'data');
            if (created) {
                return created;
            }
            throw new Error('Room creation failed');
        } catch (error) {
            this.handleError(error);
        }
    }

    async updateRoom(roomId: string, updates: Types.RoomUpdate): Promise<Types.Room> {
        try {
            const response = await this.api.put<Types.ApiResponse<Types.Room>>(
                `/api/rooms/${roomId}`,
                updates
            );
            const updated = this.extractResult<Types.Room>(response.data, 'room', 'data');
            if (updated) {
                return updated;
            }
            throw new Error('Room update failed');
        } catch (error) {
            this.handleError(error);
        }
    }

    async deleteRoom(roomId: string): Promise<void> {
        try {
            await this.api.delete(`/api/rooms/${roomId}`);
        } catch (error) {
            this.handleError(error);
        }
    }
}
