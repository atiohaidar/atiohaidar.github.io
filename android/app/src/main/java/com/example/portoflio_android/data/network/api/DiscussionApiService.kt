package com.example.portoflio_android.data.network.api

import com.example.portoflio_android.data.models.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Discussion forum API service.
 */
interface DiscussionApiService {
    
    @GET("/api/discussions")
    suspend fun getDiscussions(): Response<DiscussionsListResponse>
    
    @POST("/api/discussions")
    suspend fun createDiscussion(@Body discussion: DiscussionCreate): Response<DiscussionResponse>
    
    @GET("/api/discussions/{discussionId}")
    suspend fun getDiscussion(
        @Path("discussionId") discussionId: String
    ): Response<DiscussionResponse>
    
    @POST("/api/discussions/{discussionId}/replies")
    suspend fun createReply(
        @Path("discussionId") discussionId: String,
        @Body reply: DiscussionReplyCreate
    ): Response<DiscussionReplyResponse>
    
    @DELETE("/api/discussions/{discussionId}")
    suspend fun deleteDiscussion(
        @Path("discussionId") discussionId: String
    ): Response<ApiResponse<Unit>>
}
