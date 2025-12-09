package com.example.portoflio_android.data.network.api

import com.example.portoflio_android.data.models.*
import retrofit2.Response
import retrofit2.http.*

/**
 * User API service for CRUD operations.
 */
interface UserApiService {
    
    @GET("/api/users")
    suspend fun getUsers(): Response<UsersListResponse>
    
    @GET("/api/users/{username}")
    suspend fun getUser(@Path("username") username: String): Response<ApiResponse<User>>
    
    @POST("/api/users")
    suspend fun createUser(@Body user: UserCreate): Response<ApiResponse<User>>
    
    @PUT("/api/users/{username}")
    suspend fun updateUser(
        @Path("username") username: String,
        @Body user: UserUpdate
    ): Response<ApiResponse<User>>
    
    @DELETE("/api/users/{username}")
    suspend fun deleteUser(@Path("username") username: String): Response<ApiResponse<User>>
    
    // Self-profile update (uses /api/profile per backend)
    @PUT("/api/profile")
    suspend fun updateProfile(@Body update: ProfileUpdate): Response<ApiResponse<User>>
}

data class ProfileUpdate(
    val name: String? = null,
    val password: String? = null
)

