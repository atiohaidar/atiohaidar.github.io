package com.example.portoflio_android.data.network.api

import com.example.portoflio_android.data.models.Task
import com.example.portoflio_android.data.models.TaskCreate
import com.example.portoflio_android.data.models.TaskResponse
import com.example.portoflio_android.data.models.TaskUpdate
import com.example.portoflio_android.data.models.TasksListResponse
import retrofit2.Response
import retrofit2.http.*

/**
 * Task API service for CRUD operations.
 */
interface TaskApiService {
    
    @GET("/api/tasks")
    suspend fun getTasks(
        @Query("page") page: Int? = null,
        @Query("is_completed") isCompleted: Boolean? = null
    ): Response<TasksListResponse>
    
    @GET("/api/tasks/{taskId}")
    suspend fun getTask(@Path("taskId") taskId: Int): Response<TaskResponse>
    
    @POST("/api/tasks")
    suspend fun createTask(@Body task: TaskCreate): Response<TaskResponse>
    
    @PUT("/api/tasks/{taskId}")
    suspend fun updateTask(
        @Path("taskId") taskId: Int,
        @Body task: TaskUpdate
    ): Response<TaskResponse>
    
    @DELETE("/api/tasks/{taskId}")
    suspend fun deleteTask(@Path("taskId") taskId: Int): Response<TaskResponse>
}
