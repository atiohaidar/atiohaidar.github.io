package com.example.portoflio_android.data.repository

import com.example.portoflio_android.data.models.*
import com.example.portoflio_android.data.network.api.DiscussionApiService
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository for discussion forum operations.
 */
@Singleton
class DiscussionRepository @Inject constructor(
    private val discussionApiService: DiscussionApiService
) {
    
    suspend fun getDiscussions(): Result<List<Discussion>> {
        return try {
            val response = discussionApiService.getDiscussions()
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch discussions"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getDiscussion(discussionId: String): Result<Discussion> {
        return try {
            val response = discussionApiService.getDiscussion(discussionId)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch discussion"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createDiscussion(discussion: DiscussionCreate): Result<Discussion> {
        return try {
            val response = discussionApiService.createDiscussion(discussion)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to create discussion"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createReply(
        discussionId: String,
        content: String
    ): Result<DiscussionReply> {
        return try {
            val response = discussionApiService.createReply(
                discussionId,
                DiscussionReplyCreate(content)
            )
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to create reply"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteDiscussion(discussionId: String): Result<Unit> {
        return try {
            val response = discussionApiService.deleteDiscussion(discussionId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to delete discussion"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
