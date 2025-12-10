package com.example.portoflio_android.data.models

import com.google.gson.annotations.SerializedName

/**
 * User data class representing a user in the system.
 */
data class User(
    val username: String,
    val name: String,
    val role: UserRole,
    val balance: Double = 0.0
)

enum class UserRole {
    @SerializedName("admin")
    ADMIN,
    @SerializedName("member")
    MEMBER
}

data class UserCreate(
    val username: String,
    val name: String,
    val password: String,
    val role: UserRole? = null
)

data class UserUpdate(
    val name: String? = null,
    val password: String? = null,
    val role: UserRole? = null
)

data class LoginRequest(
    val username: String,
    val password: String
)

data class LoginResponse(
    val success: Boolean,
    val token: String,
    val user: User
)

data class RegisterRequest(
    val username: String,
    val name: String,
    val password: String
)

data class RegisterResponse(
    val success: Boolean,
    val message: String,
    val user: User?
)

data class ForgotPasswordRequest(
    val username: String,
    val newPassword: String
)

data class ForgotPasswordResponse(
    val success: Boolean,
    val message: String
)
