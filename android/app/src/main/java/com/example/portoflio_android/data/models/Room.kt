package com.example.portoflio_android.data.models

import com.google.gson.annotations.SerializedName

/**
 * Room data class for room management.
 */
data class Room(
    val id: String,
    val name: String,
    val capacity: Int,
    val description: String? = null,
    val available: Boolean = true,
    @SerializedName("created_at")
    val createdAt: String? = null,
    @SerializedName("updated_at")
    val updatedAt: String? = null
)

data class RoomCreate(
    val id: String,
    val name: String,
    val capacity: Int,
    val description: String? = null,
    val available: Boolean? = null
)

data class RoomUpdate(
    val name: String? = null,
    val capacity: Int? = null,
    val description: String? = null,
    val available: Boolean? = null
)

/**
 * Booking data class for room booking management.
 */
enum class BookingStatus {
    @SerializedName("pending")
    PENDING,
    @SerializedName("approved")
    APPROVED,
    @SerializedName("rejected")
    REJECTED,
    @SerializedName("cancelled")
    CANCELLED
}

data class Booking(
    val id: String,
    @SerializedName("room_id")
    val roomId: String,
    @SerializedName("user_username")
    val userUsername: String,
    @SerializedName("start_time")
    val startTime: String,
    @SerializedName("end_time")
    val endTime: String,
    val status: BookingStatus,
    val purpose: String? = null,
    @SerializedName("created_at")
    val createdAt: String? = null,
    @SerializedName("updated_at")
    val updatedAt: String? = null
)

data class BookingCreate(
    @SerializedName("room_id")
    val roomId: String,
    @SerializedName("start_time")
    val startTime: String,
    @SerializedName("end_time")
    val endTime: String,
    val purpose: String? = null
)

data class BookingUpdate(
    val status: BookingStatus
)
