package com.example.portoflio_android.data.models

import com.google.gson.annotations.SerializedName

/**
 * Ticket data classes for helpdesk/ticket management.
 */
enum class TicketStatus {
    @SerializedName("open")
    OPEN,
    @SerializedName("in_progress")
    IN_PROGRESS,
    @SerializedName("waiting")
    WAITING,
    @SerializedName("solved")
    SOLVED
}

enum class TicketPriority {
    @SerializedName("low")
    LOW,
    @SerializedName("medium")
    MEDIUM,
    @SerializedName("high")
    HIGH,
    @SerializedName("critical")
    CRITICAL
}

data class TicketCategory(
    val id: Int,
    val name: String,
    val description: String? = null,
    @SerializedName("created_at")
    val createdAt: String? = null
)

data class Ticket(
    val id: Int,
    val token: String,
    val title: String,
    val description: String,
    @SerializedName("category_id")
    val categoryId: Int,
    @SerializedName("category_name")
    val categoryName: String? = null,
    val status: TicketStatus,
    val priority: TicketPriority,
    @SerializedName("submitter_name")
    val submitterName: String? = null,
    @SerializedName("submitter_email")
    val submitterEmail: String? = null,
    @SerializedName("reference_link")
    val referenceLink: String? = null,
    @SerializedName("assigned_to")
    val assignedTo: String? = null,
    @SerializedName("created_at")
    val createdAt: String? = null,
    @SerializedName("updated_at")
    val updatedAt: String? = null
)

data class TicketCreate(
    val title: String,
    val description: String,
    @SerializedName("category_id")
    val categoryId: Int,
    val priority: TicketPriority? = null,
    @SerializedName("submitter_name")
    val submitterName: String? = null,
    @SerializedName("submitter_email")
    val submitterEmail: String? = null,
    @SerializedName("reference_link")
    val referenceLink: String? = null
)

data class TicketUpdate(
    val title: String? = null,
    val description: String? = null,
    @SerializedName("category_id")
    val categoryId: Int? = null,
    val status: TicketStatus? = null,
    val priority: TicketPriority? = null,
    @SerializedName("assigned_to")
    val assignedTo: String? = null
)

data class TicketComment(
    val id: Int,
    @SerializedName("ticket_id")
    val ticketId: Int,
    @SerializedName("commenter_type")
    val commenterType: String,
    @SerializedName("commenter_name")
    val commenterName: String,
    @SerializedName("comment_text")
    val commentText: String,
    @SerializedName("is_internal")
    val isInternal: Boolean,
    @SerializedName("created_at")
    val createdAt: String? = null
)

data class TicketAssignment(
    val id: Int,
    @SerializedName("ticket_id")
    val ticketId: Int,
    @SerializedName("assigned_to")
    val assignedTo: String,
    @SerializedName("assigned_by")
    val assignedBy: String,
    @SerializedName("assigned_at")
    val assignedAt: String? = null
)

data class TicketAssign(
    @SerializedName("assigned_to")
    val assignedTo: String
)

