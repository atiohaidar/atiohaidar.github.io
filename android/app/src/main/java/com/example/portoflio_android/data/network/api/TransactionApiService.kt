package com.example.portoflio_android.data.network.api

import com.example.portoflio_android.data.models.TransactionsResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

/**
 * API service for transaction/wallet operations
 */
interface TransactionApiService {
    
    @GET("/api/transactions")
    suspend fun getTransactions(
        @Query("type") type: String? = null,
        @Query("limit") limit: Int? = null
    ): Response<TransactionsResponse>
}
