package com.example.portoflio_android.data.models

import com.google.gson.annotations.SerializedName

/**
 * Generic API response wrapper.
 */
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val message: String? = null
)

/**
 * Dashboard statistics.
 */
data class DashboardStats(
    @SerializedName("totalUsers")
    val totalUsers: Int? = null,
    @SerializedName("totalTasks")
    val totalTasks: Int = 0,
    @SerializedName("completedTasks")
    val completedTasks: Int = 0,
    @SerializedName("totalArticles")
    val totalArticles: Int = 0,
    @SerializedName("publishedArticles")
    val publishedArticles: Int = 0,
    @SerializedName("totalRooms")
    val totalRooms: Int? = null,
    @SerializedName("totalBookings")
    val totalBookings: Int = 0,
    @SerializedName("pendingBookings")
    val pendingBookings: Int = 0,
    @SerializedName("approvedBookings")
    val approvedBookings: Int = 0
)

/**
 * List response wrappers.
 */
data class UsersListResponse(
    val success: Boolean,
    val users: List<User>
)

data class TasksListResponse(
    val success: Boolean,
    val tasks: List<Task>
)

data class TaskResponse(
    val success: Boolean,
    val task: Task
)

data class ArticlesListResponse(
    val success: Boolean,
    val articles: List<Article>
)

data class RoomsListResponse(
    val success: Boolean,
    val data: List<Room>
)

data class BookingsListResponse(
    val success: Boolean,
    val data: List<Booking>
)

data class EventsListResponse(
    val success: Boolean,
    val data: List<Event>
)

data class TicketsListResponse(
    val success: Boolean,
    val data: List<Ticket>
)

data class StatsResponse(
    val success: Boolean,
    val data: DashboardStats
)
