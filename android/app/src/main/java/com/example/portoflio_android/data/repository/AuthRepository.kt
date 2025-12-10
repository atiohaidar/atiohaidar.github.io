package com.example.portoflio_android.data.repository

import com.example.portoflio_android.data.local.TokenManager
import com.example.portoflio_android.data.models.LoginRequest
import com.example.portoflio_android.data.models.LoginResponse
import com.example.portoflio_android.data.models.RegisterRequest
import com.example.portoflio_android.data.models.RegisterResponse
import com.example.portoflio_android.data.models.ForgotPasswordRequest
import com.example.portoflio_android.data.models.ForgotPasswordResponse
import com.example.portoflio_android.data.models.User
import com.example.portoflio_android.data.network.api.AuthApiService
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Authentication repository handling login/logout operations.
 */
@Singleton
class AuthRepository @Inject constructor(
    private val authApiService: AuthApiService,
    private val tokenManager: TokenManager
) {
    
    /**
     * Login with username and password.
     */
    suspend fun login(username: String, password: String): Result<LoginResponse> {
        return try {
            val response = authApiService.login(LoginRequest(username, password))
            if (response.isSuccessful && response.body() != null) {
                val loginResponse = response.body()!!
                if (loginResponse.success) {
                    // Save token and user data
                    tokenManager.saveAuth(loginResponse.token, loginResponse.user)
                    Result.success(loginResponse)
                } else {
                    Result.failure(Exception("Login failed"))
                }
            } else {
                Result.failure(Exception(response.message() ?: "Login failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Register a new user account.
     */
    suspend fun register(username: String, name: String, password: String): Result<RegisterResponse> {
        return try {
            val response = authApiService.register(RegisterRequest(username, name, password))
            if (response.isSuccessful && response.body() != null) {
                val registerResponse = response.body()!!
                if (registerResponse.success) {
                    Result.success(registerResponse)
                } else {
                    Result.failure(Exception(registerResponse.message))
                }
            } else {
                Result.failure(Exception(response.message() ?: "Registration failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Reset password for a user (simple reset - no email verification).
     */
    suspend fun forgotPassword(username: String, newPassword: String): Result<ForgotPasswordResponse> {
        return try {
            val response = authApiService.forgotPassword(ForgotPasswordRequest(username, newPassword))
            if (response.isSuccessful && response.body() != null) {
                val forgotResponse = response.body()!!
                if (forgotResponse.success) {
                    Result.success(forgotResponse)
                } else {
                    Result.failure(Exception(forgotResponse.message))
                }
            } else {
                Result.failure(Exception(response.message() ?: "Password reset failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get current logged in user.
     */
    suspend fun getCurrentUser(): User? = tokenManager.getUser()
    
    /**
     * Check if user is logged in.
     */
    suspend fun isLoggedIn(): Boolean = tokenManager.isLoggedIn()
    
    /**
     * Logout and clear all auth data.
     */
    suspend fun logout() {
        tokenManager.clear()
    }
}
