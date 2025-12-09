package com.example.portoflio_android.data.models

import com.google.gson.annotations.SerializedName

/**
 * Task data class for task management.
 */
data class Task(
    val id: Int,
    val name: String,
    val description: String? = null,
    val completed: Boolean = false,
    @SerializedName("due_date")
    val dueDate: String? = null,
    val owner: String? = null,
    @SerializedName("created_at")
    val createdAt: String? = null,
    @SerializedName("updated_at")
    val updatedAt: String? = null
)

data class TaskCreate(
    val name: String,
    val description: String? = null,
    val completed: Boolean? = true,
    @SerializedName("due_date")
    val dueDate: String? = null
)

data class TaskUpdate(
    val name: String? = null,
    val description: String? = null,
    val completed: Boolean? = null,
    @SerializedName("due_date")
    val dueDate: String? = null
)
