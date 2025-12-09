package com.example.portoflio_android.data.network.api

import com.example.portoflio_android.data.models.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Anonymous chat API service.
 */
interface AnonymousChatApiService {
    
    @GET("/api/anonymous/messages")
    suspend fun getMessages(): Response<AnonymousMessagesListResponse>
    
    @POST("/api/anonymous/messages")
    suspend fun sendMessage(@Body message: AnonymousMessageSend): Response<AnonymousMessageResponse>
    
    @DELETE("/api/anonymous/messages")
    suspend fun deleteAllMessages(): Response<ApiResponse<Unit>>
}
