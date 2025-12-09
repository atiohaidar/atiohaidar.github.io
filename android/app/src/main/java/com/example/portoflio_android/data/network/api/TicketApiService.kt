package com.example.portoflio_android.data.network.api

import com.example.portoflio_android.data.models.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Ticket API service for helpdesk.
 */
interface TicketApiService {
    
    // Categories
    @GET("/api/tickets/categories")
    suspend fun getCategories(): Response<ApiResponse<List<TicketCategory>>>
    
    // Tickets
    @GET("/api/tickets")
    suspend fun getTickets(
        @Query("page") page: Int? = null,
        @Query("status") status: String? = null,
        @Query("category_id") categoryId: Int? = null,
        @Query("assigned_to") assignedTo: String? = null
    ): Response<TicketsListResponse>
    
    @GET("/api/tickets/{ticketId}")
    suspend fun getTicket(@Path("ticketId") ticketId: Int): Response<ApiResponse<Ticket>>
    
    @PUT("/api/tickets/{ticketId}")
    suspend fun updateTicket(
        @Path("ticketId") ticketId: Int,
        @Body update: TicketUpdate
    ): Response<ApiResponse<Ticket>>
    
    @DELETE("/api/tickets/{ticketId}")
    suspend fun deleteTicket(@Path("ticketId") ticketId: Int): Response<ApiResponse<Unit>>
    
    // Comments
    @GET("/api/tickets/{ticketId}/comments")
    suspend fun getComments(
        @Path("ticketId") ticketId: Int,
        @Query("include_internal") includeInternal: Boolean? = null
    ): Response<ApiResponse<List<TicketComment>>>
    
    @POST("/api/tickets/{ticketId}/comments")
    suspend fun addComment(
        @Path("ticketId") ticketId: Int,
        @Body comment: TicketCommentCreate
    ): Response<ApiResponse<TicketComment>>
    
    // Stats
    @GET("/api/tickets/stats")
    suspend fun getStats(
        @Query("assigned_to") assignedTo: String? = null
    ): Response<ApiResponse<TicketStats>>
    
    // Public ticket creation
    @POST("/api/public/tickets")
    suspend fun createPublicTicket(@Body ticket: TicketCreate): Response<ApiResponse<Ticket>>
}

data class TicketCommentCreate(
    val comment_text: String,
    val is_internal: Boolean? = null
)

data class TicketStats(
    val total: Int,
    val open: Int,
    val in_progress: Int,
    val waiting: Int,
    val solved: Int
)
