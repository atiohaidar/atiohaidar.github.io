export interface Room {
  id: string;
  name: string;
  capacity: number;
  description?: string;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomCreate {
  name: string;
  capacity: number;
  description?: string;
  available?: boolean;
}

export interface RoomUpdate {
  name?: string;
  capacity?: number;
  description?: string;
  available?: boolean;
}

export interface RoomListResponse {
  success: boolean;
  data: Room[];
}

export interface RoomResponse {
  success: boolean;
  data: Room;
}
