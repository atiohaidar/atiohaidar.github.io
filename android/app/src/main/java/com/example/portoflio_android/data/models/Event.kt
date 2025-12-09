package com.example.portoflio_android.data.models

import com.google.gson.annotations.SerializedName

/**
 * Event data classes for event management.
 */
data class Event(
    val id: String,
    val title: String,
    val description: String? = null,
    @SerializedName("event_date")
    val eventDate: String,
    val location: String? = null,
    @SerializedName("created_by")
    val createdBy: String,
    @SerializedName("created_at")
    val createdAt: String? = null,
    @SerializedName("updated_at")
    val updatedAt: String? = null
)

data class EventCreate(
    val title: String,
    val description: String? = null,
    @SerializedName("event_date")
    val eventDate: String,
    val location: String? = null
)

data class EventUpdate(
    val title: String? = null,
    val description: String? = null,
    @SerializedName("event_date")
    val eventDate: String? = null,
    val location: String? = null
)

enum class AttendeeStatus {
    @SerializedName("registered")
    REGISTERED,
    @SerializedName("present")
    PRESENT,
    @SerializedName("absent")
    ABSENT
}

data class EventAttendee(
    val id: String,
    @SerializedName("event_id")
    val eventId: String,
    @SerializedName("user_username")
    val userUsername: String,
    @SerializedName("attendance_token")
    val attendanceToken: String,
    val status: AttendeeStatus,
    @SerializedName("registered_at")
    val registeredAt: String? = null
)

data class EventAdmin(
    val id: String,
    @SerializedName("event_id")
    val eventId: String,
    val username: String,
    @SerializedName("assigned_at")
    val assignedAt: String? = null
)

data class AttendanceScan(
    val id: String,
    @SerializedName("event_id")
    val eventId: String,
    @SerializedName("attendee_id")
    val attendeeId: String,
    @SerializedName("scanned_by")
    val scannedBy: String,
    @SerializedName("scanned_at")
    val scannedAt: String? = null
)

data class AttendeeWithScans(
    val attendee: EventAttendee,
    val scans: List<AttendanceScan>
)

