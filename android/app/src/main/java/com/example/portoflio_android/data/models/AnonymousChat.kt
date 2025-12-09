package com.example.portoflio_android.data.models

import com.google.gson.annotations.SerializedName

/**
 * Anonymous chat data classes.
 */
data class AnonymousMessage(
    val id: String,
    val content: String,
    @SerializedName("sender_name")
    val senderName: String? = null,
    @SerializedName("created_at")
    val createdAt: String? = null
)

data class AnonymousMessageSend(
    val content: String,
    @SerializedName("sender_name")
    val senderName: String? = null
)

// API Response wrappers
data class AnonymousMessagesListResponse(
    val success: Boolean,
    val data: List<AnonymousMessage>
)

data class AnonymousMessageResponse(
    val success: Boolean,
    val data: AnonymousMessage
)
