package com.example.portoflio_android.data.network.api

import com.example.portoflio_android.data.models.DashboardStats
import com.example.portoflio_android.data.models.StatsResponse
import retrofit2.Response
import retrofit2.http.GET

/**
 * Stats API service for dashboard statistics.
 */
interface StatsApiService {
    
    @GET("/api/stats")
    suspend fun getStats(): Response<StatsResponse>
}
