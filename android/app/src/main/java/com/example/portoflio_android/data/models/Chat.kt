package com.example.portoflio_android.data.models

import com.google.gson.annotations.SerializedName

/**
 * Chat data classes for direct messaging and group chats.
 */

// Direct Conversation Models
data class Conversation(
    val id: String,
    @SerializedName("user1_username")
    val user1Username: String,
    @SerializedName("user2_username")
    val user2Username: String,
    @SerializedName("last_message")
    val lastMessage: String? = null,
    @SerializedName("last_message_at")
    val lastMessageAt: String? = null,
    @SerializedName("created_at")
    val createdAt: String? = null,
    @SerializedName("other_username")
    val otherUsername: String? = null
)

data class Message(
    val id: String,
    @SerializedName("conversation_id")
    val conversationId: String? = null,
    @SerializedName("group_id")
    val groupId: String? = null,
    @SerializedName("sender_username")
    val senderUsername: String,
    val content: String,
    @SerializedName("created_at")
    val createdAt: String? = null
)

data class MessageSend(
    @SerializedName("conversation_id")
    val conversationId: String? = null,
    @SerializedName("group_id")
    val groupId: String? = null,
    val content: String
)

// Group Chat Models
data class Group(
    val id: String,
    val name: String,
    val description: String? = null,
    @SerializedName("created_by")
    val createdBy: String,
    @SerializedName("created_at")
    val createdAt: String? = null,
    @SerializedName("updated_at")
    val updatedAt: String? = null,
    @SerializedName("member_count")
    val memberCount: Int? = null
)

data class GroupCreate(
    val name: String,
    val description: String? = null
)

data class GroupUpdate(
    val name: String? = null,
    val description: String? = null
)

enum class GroupMemberRole {
    @SerializedName("admin")
    ADMIN,
    @SerializedName("member")
    MEMBER
}

data class GroupMember(
    val id: String,
    @SerializedName("group_id")
    val groupId: String,
    val username: String,
    val role: GroupMemberRole,
    @SerializedName("joined_at")
    val joinedAt: String? = null
)

data class GroupMemberAdd(
    val username: String
)

data class GroupMemberRoleUpdate(
    val role: GroupMemberRole
)

// API Response wrappers
data class ConversationsListResponse(
    val success: Boolean,
    val data: List<Conversation>
)

data class ConversationResponse(
    val success: Boolean,
    val data: Conversation
)

data class MessagesListResponse(
    val success: Boolean,
    val data: List<Message>
)

data class MessageResponse(
    val success: Boolean,
    val data: Message
)

data class GroupsListResponse(
    val success: Boolean,
    val data: List<Group>
)

data class GroupResponse(
    val success: Boolean,
    val data: Group
)

data class GroupMembersListResponse(
    val success: Boolean,
    val data: List<GroupMember>
)

data class GroupMemberResponse(
    val success: Boolean,
    val data: GroupMember
)
