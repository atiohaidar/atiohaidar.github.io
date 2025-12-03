import { apiFetch } from '../lib/api';
import type { Room, RoomCreate, RoomUpdate, RoomListResponse, RoomResponse } from '../types/room';

export const roomService = {
  // Get all rooms
  async getRooms(available?: boolean): Promise<Room[]> {
    const params = available !== undefined ? `?available=${available}` : '';
    const response = await apiFetch<RoomListResponse>(`/api/rooms${params}`);
    return response.data;
  },

  // Get single room
  async getRoom(roomId: string): Promise<Room> {
    const response = await apiFetch<RoomResponse>(`/api/rooms/${roomId}`);
    return response.data;
  },

  // Create room (admin only)
  async createRoom(roomData: RoomCreate): Promise<Room> {
    const response = await apiFetch<RoomResponse>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
    return response.data;
  },

  // Update room (admin only)
  async updateRoom(roomId: string, roomData: RoomUpdate): Promise<Room> {
    const response = await apiFetch<RoomResponse>(`/api/rooms/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(roomData)
    });
    return response.data;
  },

  // Delete room (admin only)
  async deleteRoom(roomId: string): Promise<Room> {
    const response = await apiFetch<RoomResponse>(`/api/rooms/${roomId}`, {
      method: 'DELETE'
    });
    return response.data;
  }
};
