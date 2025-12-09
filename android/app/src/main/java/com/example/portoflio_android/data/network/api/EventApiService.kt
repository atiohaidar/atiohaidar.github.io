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
}

data class EventAttendeeRegister(
    val event_id: String
)
