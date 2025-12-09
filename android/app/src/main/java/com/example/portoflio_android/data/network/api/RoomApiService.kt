package com.example.portoflio_android.data.network.api

import com.example.portoflio_android.data.models.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Room and Booking API service.
 */
interface RoomApiService {
    
    // Room endpoints
    @GET("/api/rooms")
    suspend fun getRooms(
        @Query("available") available: Boolean? = null
    ): Response<RoomsListResponse>
    
    @GET("/api/rooms/{roomId}")
    suspend fun getRoom(@Path("roomId") roomId: String): Response<ApiResponse<Room>>
    
    @POST("/api/rooms")
    suspend fun createRoom(@Body room: RoomCreate): Response<ApiResponse<Room>>
    
    @PUT("/api/rooms/{roomId}")
    suspend fun updateRoom(
        @Path("roomId") roomId: String,
        @Body room: RoomUpdate
    ): Response<ApiResponse<Room>>
    
    @DELETE("/api/rooms/{roomId}")
    suspend fun deleteRoom(@Path("roomId") roomId: String): Response<ApiResponse<Room>>
    
    // Booking endpoints
    @GET("/api/bookings")
    suspend fun getBookings(
        @Query("room_id") roomId: String? = null,
        @Query("status") status: String? = null
    ): Response<BookingsListResponse>
    
    @GET("/api/bookings/{bookingId}")
    suspend fun getBooking(@Path("bookingId") bookingId: String): Response<ApiResponse<Booking>>
    
    @POST("/api/bookings")
    suspend fun createBooking(@Body booking: BookingCreate): Response<ApiResponse<Booking>>
    
    @PUT("/api/bookings/{bookingId}")
    suspend fun updateBookingStatus(
        @Path("bookingId") bookingId: String,
        @Body update: BookingStatusUpdate
    ): Response<ApiResponse<Booking>>
    
    @PUT("/api/bookings/{bookingId}/edit")
    suspend fun editBooking(
        @Path("bookingId") bookingId: String,
        @Body update: BookingUpdate
    ): Response<ApiResponse<Booking>>
    
    @DELETE("/api/bookings/{bookingId}")
    suspend fun cancelBooking(@Path("bookingId") bookingId: String): Response<ApiResponse<Booking>>
}

data class BookingStatusUpdate(
    val status: String
)
