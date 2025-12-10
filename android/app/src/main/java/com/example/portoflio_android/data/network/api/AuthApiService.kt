package com.example.portoflio_android.data.network.api

import com.example.portoflio_android.data.models.LoginRequest
import com.example.portoflio_android.data.models.LoginResponse
import com.example.portoflio_android.data.models.RegisterRequest
import com.example.portoflio_android.data.models.RegisterResponse
import com.example.portoflio_android.data.models.ForgotPasswordRequest
import com.example.portoflio_android.data.models.ForgotPasswordResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

/**
 * Authentication API service.
 */
interface AuthApiService {
    
    @POST("/api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
    
    @POST("/api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<RegisterResponse>
    
    @POST("/api/auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<ForgotPasswordResponse>
}
