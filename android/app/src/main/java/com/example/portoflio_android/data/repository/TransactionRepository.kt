package com.example.portoflio_android.data.repository

import com.example.portoflio_android.data.models.Transaction
import com.example.portoflio_android.data.network.api.TransactionApiService
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository for transaction/wallet operations
 */
@Singleton
class TransactionRepository @Inject constructor(
    private val apiService: TransactionApiService
) {
    
    suspend fun getTransactions(
        type: String? = null,
        limit: Int? = null
    ): Result<List<Transaction>> {
        return try {
            val response = apiService.getTransactions(type, limit)
            if (response.isSuccessful) {
                val transactions = response.body()?.transactions ?: emptyList()
                Result.success(transactions)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch transactions"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
