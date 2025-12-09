package com.example.portoflio_android.data.repository

import com.example.portoflio_android.data.models.*
import com.example.portoflio_android.data.network.api.ChatApiService
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository for chat operations (direct messages and groups).
 */
@Singleton
class ChatRepository @Inject constructor(
    private val chatApiService: ChatApiService
) {
    
    // ===== Direct Conversations =====
    
    suspend fun getConversations(): Result<List<Conversation>> {
        return try {
            val response = chatApiService.getConversations()
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch conversations"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getOrCreateConversation(username: String): Result<Conversation> {
        return try {
            val response = chatApiService.getOrCreateConversation(username)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get/create conversation"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getConversationMessages(
        conversationId: String,
        page: Int? = null,
        limit: Int? = null
    ): Result<List<Message>> {
        return try {
            val response = chatApiService.getConversationMessages(conversationId, page, limit)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch messages"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun sendMessage(message: MessageSend): Result<Message> {
        return try {
            val response = chatApiService.sendMessage(message)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to send message"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // ===== Group Chats =====
    
    suspend fun getGroups(): Result<List<Group>> {
        return try {
            val response = chatApiService.getGroups()
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch groups"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createGroup(group: GroupCreate): Result<Group> {
        return try {
            val response = chatApiService.createGroup(group)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to create group"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getGroup(groupId: String): Result<Group> {
        return try {
            val response = chatApiService.getGroup(groupId)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch group"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateGroup(groupId: String, update: GroupUpdate): Result<Group> {
        return try {
            val response = chatApiService.updateGroup(groupId, update)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update group"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteGroup(groupId: String): Result<Unit> {
        return try {
            val response = chatApiService.deleteGroup(groupId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to delete group"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getGroupMessages(
        groupId: String,
        page: Int? = null,
        limit: Int? = null
    ): Result<List<Message>> {
        return try {
            val response = chatApiService.getGroupMessages(groupId, page, limit)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch group messages"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getGroupMembers(groupId: String): Result<List<GroupMember>> {
        return try {
            val response = chatApiService.getGroupMembers(groupId)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch group members"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun addGroupMember(groupId: String, username: String): Result<GroupMember> {
        return try {
            val response = chatApiService.addGroupMember(groupId, GroupMemberAdd(username))
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to add member"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun removeGroupMember(groupId: String, username: String): Result<Unit> {
        return try {
            val response = chatApiService.removeGroupMember(groupId, username)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to remove member"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateMemberRole(
        groupId: String,
        username: String,
        role: GroupMemberRole
    ): Result<GroupMember> {
        return try {
            val response = chatApiService.updateMemberRole(groupId, username, GroupMemberRoleUpdate(role))
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update member role"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
