package com.example.portoflio_android.data.repository

import com.example.portoflio_android.data.local.TokenManager
import com.example.portoflio_android.data.models.LoginRequest
import com.example.portoflio_android.data.models.LoginResponse
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
