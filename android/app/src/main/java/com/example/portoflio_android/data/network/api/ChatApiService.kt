package com.example.portoflio_android.data.network.api

import com.example.portoflio_android.data.models.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Chat API service for direct messaging and group chats.
 */
interface ChatApiService {
    
    // ===== Direct Conversations =====
    
    @GET("/api/conversations")
    suspend fun getConversations(): Response<ConversationsListResponse>
    
    @GET("/api/conversations/{username}")
    suspend fun getOrCreateConversation(
        @Path("username") username: String
    ): Response<ConversationResponse>
    
    @GET("/api/conversations/{conversationId}/messages")
    suspend fun getConversationMessages(
        @Path("conversationId") conversationId: String,
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null
    ): Response<MessagesListResponse>
    
    @POST("/api/messages")
    suspend fun sendMessage(@Body message: MessageSend): Response<MessageResponse>
    
    // ===== Group Chats =====
    
    @GET("/api/groups")
    suspend fun getGroups(): Response<GroupsListResponse>
    
    @POST("/api/groups")
    suspend fun createGroup(@Body group: GroupCreate): Response<GroupResponse>
    
    @GET("/api/groups/{groupId}")
    suspend fun getGroup(@Path("groupId") groupId: String): Response<GroupResponse>
    
    @PUT("/api/groups/{groupId}")
    suspend fun updateGroup(
        @Path("groupId") groupId: String,
        @Body update: GroupUpdate
    ): Response<GroupResponse>
    
    @DELETE("/api/groups/{groupId}")
    suspend fun deleteGroup(@Path("groupId") groupId: String): Response<ApiResponse<Unit>>
    
    @GET("/api/groups/{groupId}/messages")
    suspend fun getGroupMessages(
        @Path("groupId") groupId: String,
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null
    ): Response<MessagesListResponse>
    
    @GET("/api/groups/{groupId}/members")
    suspend fun getGroupMembers(
        @Path("groupId") groupId: String
    ): Response<GroupMembersListResponse>
    
    @POST("/api/groups/{groupId}/members")
    suspend fun addGroupMember(
        @Path("groupId") groupId: String,
        @Body member: GroupMemberAdd
    ): Response<GroupMemberResponse>
    
    @DELETE("/api/groups/{groupId}/members/{username}")
    suspend fun removeGroupMember(
        @Path("groupId") groupId: String,
        @Path("username") username: String
    ): Response<ApiResponse<Unit>>
    
    @PUT("/api/groups/{groupId}/members/{username}/role")
    suspend fun updateMemberRole(
        @Path("groupId") groupId: String,
        @Path("username") username: String,
        @Body roleUpdate: GroupMemberRoleUpdate
    ): Response<GroupMemberResponse>
}
