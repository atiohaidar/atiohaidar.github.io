package com.example.portoflio_android.data.repository

import com.example.portoflio_android.data.models.Task
import com.example.portoflio_android.data.models.TaskCreate
import com.example.portoflio_android.data.models.TaskUpdate
import com.example.portoflio_android.data.network.api.TaskApiService
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Task repository for CRUD operations.
 */
@Singleton
class TaskRepository @Inject constructor(
    private val taskApiService: TaskApiService
) {
    
    /**
     * Get all tasks with optional filters.
     */
    suspend fun getTasks(page: Int? = null, isCompleted: Boolean? = null): Result<List<Task>> {
        return try {
            val response = taskApiService.getTasks(page, isCompleted)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.tasks)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get tasks"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get a single task by ID.
     */
    suspend fun getTask(taskId: Int): Result<Task> {
        return try {
            val response = taskApiService.getTask(taskId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.task)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get task"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Create a new task.
     */
    suspend fun createTask(task: TaskCreate): Result<Task> {
        return try {
            val response = taskApiService.createTask(task)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.task)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to create task"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Update an existing task.
     */
    suspend fun updateTask(taskId: Int, update: TaskUpdate): Result<Task> {
        return try {
            val response = taskApiService.updateTask(taskId, update)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.task)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update task"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Delete a task.
     */
    suspend fun deleteTask(taskId: Int): Result<Unit> {
        return try {
            val response = taskApiService.deleteTask(taskId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to delete task"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
