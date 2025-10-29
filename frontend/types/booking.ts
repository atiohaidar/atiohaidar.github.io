export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface Booking {
  id: string;
  user_username: string;
  room_id: string;
  room_name?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface BookingCreate {
  room_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
}

export interface BookingUpdate {
  status: BookingStatus;
}

export interface BookingListResponse {
  success: boolean;
  data: Booking[];
}

export interface BookingResponse {
  success: boolean;
  data: Booking;
}
