package com.example.portoflio_android.data.network.api

import com.example.portoflio_android.data.models.LoginRequest
import com.example.portoflio_android.data.models.LoginResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

/**
 * Authentication API service.
 */
interface AuthApiService {
    
    @POST("/api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
}
