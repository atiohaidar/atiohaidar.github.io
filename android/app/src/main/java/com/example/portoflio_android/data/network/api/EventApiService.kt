package com.example.portoflio_android.data.network.api

import com.example.portoflio_android.data.models.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Event API service for event management.
 */
interface EventApiService {
    
    @GET("/api/events")
    suspend fun getEvents(): Response<EventsListResponse>
    
    @GET("/api/events/{eventId}")
    suspend fun getEvent(@Path("eventId") eventId: String): Response<ApiResponse<Event>>
    
    @POST("/api/events")
    suspend fun createEvent(@Body event: EventCreate): Response<ApiResponse<Event>>
    
    @PUT("/api/events/{eventId}")
    suspend fun updateEvent(
        @Path("eventId") eventId: String,
        @Body event: EventUpdate
    ): Response<ApiResponse<Event>>
    
    @DELETE("/api/events/{eventId}")
    suspend fun deleteEvent(@Path("eventId") eventId: String): Response<ApiResponse<Event>>
    
    // Attendee operations
    @GET("/api/events/{eventId}/attendees")
    suspend fun getAttendees(@Path("eventId") eventId: String): Response<ApiResponse<List<EventAttendee>>>
    
    @POST("/api/events/register")
    suspend fun registerForEvent(@Body request: EventAttendeeRegister): Response<ApiResponse<EventAttendee>>
    
    @DELETE("/api/events/{eventId}/attendees/{attendeeId}")
    suspend fun unregisterFromEvent(
        @Path("eventId") eventId: String,
        @Path("attendeeId") attendeeId: String
    ): Response<ApiResponse<Unit>>
    
    // Attendee status update
    @PUT("/api/events/{eventId}/attendees/{attendeeId}/status")
    suspend fun updateAttendeeStatus(
        @Path("eventId") eventId: String,
        @Path("attendeeId") attendeeId: String,
        @Body status: AttendeeStatusUpdate
    ): Response<ApiResponse<EventAttendee>>
    
    @GET("/api/events/{eventId}/attendees/{attendeeId}/scans")
    suspend fun getAttendeeScans(
        @Path("eventId") eventId: String,
        @Path("attendeeId") attendeeId: String
    ): Response<ApiResponse<AttendeeWithScans>>
    
    // Admin operations
    @GET("/api/events/{eventId}/admins")
    suspend fun getEventAdmins(
        @Path("eventId") eventId: String
    ): Response<ApiResponse<List<EventAdmin>>>
    
    @POST("/api/events/{eventId}/admins")
    suspend fun assignEventAdmin(
        @Path("eventId") eventId: String,
        @Body admin: EventAdminAssign
    ): Response<ApiResponse<EventAdmin>>
    
    @DELETE("/api/events/{eventId}/admins/{username}")
    suspend fun removeEventAdmin(
        @Path("eventId") eventId: String,
        @Path("username") username: String
    ): Response<ApiResponse<Unit>>
    
    // Attendance scanning
    @POST("/api/events/{eventId}/scan")
    suspend fun scanAttendance(
        @Path("eventId") eventId: String,
        @Body scan: AttendanceScanRequest
    ): Response<ApiResponse<AttendanceScan>>
    
    @GET("/api/events/{eventId}/scan-history")
    suspend fun getScanHistory(
        @Path("eventId") eventId: String
    ): Response<ApiResponse<List<AttendanceScan>>>
}

data class EventAttendeeRegister(
    val event_id: String
)

data class AttendeeStatusUpdate(
    val status: String
)

data class EventAdminAssign(
    val username: String
)

data class AttendanceScanRequest(
    val token: String
)

