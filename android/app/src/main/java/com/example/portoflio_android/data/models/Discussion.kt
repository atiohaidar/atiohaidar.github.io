package com.example.portoflio_android.data.models

import com.google.gson.annotations.SerializedName

/**
 * Discussion forum data classes.
 */
data class Discussion(
    val id: String,
    val title: String,
    val content: String,
    @SerializedName("author_username")
    val authorUsername: String,
    @SerializedName("author_name")
    val authorName: String? = null,
    @SerializedName("reply_count")
    val replyCount: Int = 0,
    @SerializedName("created_at")
    val createdAt: String? = null,
    @SerializedName("updated_at")
    val updatedAt: String? = null,
    val replies: List<DiscussionReply>? = null
)

data class DiscussionReply(
    val id: String,
    @SerializedName("discussion_id")
    val discussionId: String,
    val content: String,
    @SerializedName("author_username")
    val authorUsername: String,
    @SerializedName("author_name")
    val authorName: String? = null,
    @SerializedName("created_at")
    val createdAt: String? = null
)

data class DiscussionCreate(
    val title: String,
    val content: String
)

data class DiscussionReplyCreate(
    val content: String
)

// API Response wrappers
data class DiscussionsListResponse(
    val success: Boolean,
    val data: List<Discussion>
)

data class DiscussionResponse(
    val success: Boolean,
    val data: Discussion
)

data class DiscussionReplyResponse(
    val success: Boolean,
    val data: DiscussionReply
)
