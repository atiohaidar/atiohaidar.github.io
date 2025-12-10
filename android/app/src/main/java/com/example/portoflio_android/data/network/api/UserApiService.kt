package com.example.portoflio_android.data.network.api

import com.example.portoflio_android.data.models.*
import com.google.gson.annotations.SerializedName
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

    @POST("/api/users/transfer")
    suspend fun transfer(@Body request: TransferRequest): Response<ApiResponse<Unit>>

    @POST("/api/users/topup")
    suspend fun topUp(@Body request: TopUpRequest): Response<ApiResponse<Unit>>
}

data class ProfileUpdate(
    val name: String? = null,
    val password: String? = null
)

data class TransferRequest(
    @SerializedName("to_username") val toUsername: String,
    val amount: Double,
    val description: String? = null
)

data class TopUpRequest(
    @SerializedName("target_username") val targetUsername: String,
    val amount: Double,
    val description: String? = null
)

