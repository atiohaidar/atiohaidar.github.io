package com.example.portoflio_android.data.repository

import com.example.portoflio_android.data.models.*
import com.example.portoflio_android.data.network.api.AnonymousChatApiService
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository for anonymous chat operations.
 */
@Singleton
class AnonymousChatRepository @Inject constructor(
    private val anonymousChatApiService: AnonymousChatApiService
) {
    
    suspend fun getMessages(): Result<List<AnonymousMessage>> {
        return try {
            val response = anonymousChatApiService.getMessages()
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get messages"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun sendMessage(content: String, senderName: String?): Result<AnonymousMessage> {
        return try {
            val message = AnonymousMessageSend(content, senderName)
            val response = anonymousChatApiService.sendMessage(message)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to send message"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteAllMessages(): Result<Unit> {
        return try {
            val response = anonymousChatApiService.deleteAllMessages()
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to delete messages"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
