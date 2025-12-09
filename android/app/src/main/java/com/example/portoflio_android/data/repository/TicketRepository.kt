package com.example.portoflio_android.data.repository

import com.example.portoflio_android.data.models.*
import com.example.portoflio_android.data.network.api.TicketApiService
import com.example.portoflio_android.data.network.api.TicketCommentCreate
import com.example.portoflio_android.data.network.api.TicketStats
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Ticket repository for helpdesk.
 */
@Singleton
class TicketRepository @Inject constructor(
    private val ticketApiService: TicketApiService
) {
    
    suspend fun getCategories(): Result<List<TicketCategory>> {
        return try {
            val response = ticketApiService.getCategories()
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get categories"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getTickets(status: String? = null, categoryId: Int? = null): Result<List<Ticket>> {
        return try {
            val response = ticketApiService.getTickets(status = status, categoryId = categoryId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get tickets"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getTicket(ticketId: Int): Result<Ticket> {
        return try {
            val response = ticketApiService.getTicket(ticketId)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get ticket"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateTicket(ticketId: Int, update: TicketUpdate): Result<Ticket> {
        return try {
            val response = ticketApiService.updateTicket(ticketId, update)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update ticket"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getComments(ticketId: Int): Result<List<TicketComment>> {
        return try {
            val response = ticketApiService.getComments(ticketId)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get comments"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun addComment(ticketId: Int, text: String): Result<TicketComment> {
        return try {
            val comment = TicketCommentCreate(comment_text = text)
            val response = ticketApiService.addComment(ticketId, comment)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to add comment"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getStats(): Result<TicketStats> {
        return try {
            val response = ticketApiService.getStats()
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get stats"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
