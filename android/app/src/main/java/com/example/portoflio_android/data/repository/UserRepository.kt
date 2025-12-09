package com.example.portoflio_android.data.repository

import com.example.portoflio_android.data.models.*
import com.example.portoflio_android.data.network.api.UserApiService
import javax.inject.Inject
import javax.inject.Singleton

/**
 * User repository for user management.
 */
@Singleton
class UserRepository @Inject constructor(
    private val userApiService: UserApiService
) {
    
    suspend fun getUsers(): Result<List<User>> {
        return try {
            val response = userApiService.getUsers()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.users)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get users"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createUser(user: UserCreate): Result<User> {
        return try {
            val response = userApiService.createUser(user)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to create user"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateUser(username: String, update: UserUpdate): Result<User> {
        return try {
            val response = userApiService.updateUser(username, update)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update user"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteUser(username: String): Result<Unit> {
        return try {
            val response = userApiService.deleteUser(username)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to delete user"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Self-profile operations
    suspend fun getCurrentUser(): Result<User> {
        return try {
            val response = userApiService.getCurrentUser()
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get current user"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateCurrentUser(name: String?, password: String?): Result<User> {
        return try {
            val update = com.example.portoflio_android.data.network.api.ProfileUpdate(name, password)
            val response = userApiService.updateCurrentUser(update)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update profile"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

