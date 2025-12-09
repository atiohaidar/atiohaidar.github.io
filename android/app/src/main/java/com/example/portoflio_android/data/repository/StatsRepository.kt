package com.example.portoflio_android.data.repository

import com.example.portoflio_android.data.models.DashboardStats
import com.example.portoflio_android.data.network.api.StatsApiService
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Stats repository for dashboard statistics.
 */
@Singleton
class StatsRepository @Inject constructor(
    private val statsApiService: StatsApiService
) {
    
    suspend fun getStats(): Result<DashboardStats> {
        return try {
            val response = statsApiService.getStats()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get stats"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
