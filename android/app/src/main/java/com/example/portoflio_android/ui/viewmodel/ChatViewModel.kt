package com.example.portoflio_android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.portoflio_android.data.models.*
import com.example.portoflio_android.data.repository.ChatRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ChatUiState(
    // Main lists
    val conversations: List<Conversation> = emptyList(),
    val groups: List<Group> = emptyList(),
    
    // Active conversation/group
    val activeConversation: Conversation? = null,
    val activeGroup: Group? = null,
    val messages: List<Message> = emptyList(),
    val groupMembers: List<GroupMember> = emptyList(),
    
    // UI State
    val isLoading: Boolean = false,
    val error: String? = null,
    val selectedTab: Int = 0 // 0 = Conversations, 1 = Groups
)

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatRepository: ChatRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()
    
    init {
        loadConversations()
        loadGroups()
    }
    
    fun selectTab(tab: Int) {
        _uiState.value = _uiState.value.copy(selectedTab = tab)
    }
    
    // ===== Conversations =====
    
    fun loadConversations() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            chatRepository.getConversations()
                .onSuccess { conversations ->
                    _uiState.value = _uiState.value.copy(
                        conversations = conversations,
                        isLoading = false
                    )
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message
                    )
                }
        }
    }
    
    fun startConversation(username: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            chatRepository.getOrCreateConversation(username)
                .onSuccess { conversation ->
                    _uiState.value = _uiState.value.copy(
                        activeConversation = conversation,
                        isLoading = false
                    )
                    loadConversationMessages(conversation.id)
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message
                    )
                }
        }
    }
    
    fun selectConversation(conversation: Conversation) {
        _uiState.value = _uiState.value.copy(
            activeConversation = conversation,
            activeGroup = null,
            messages = emptyList()
        )
        loadConversationMessages(conversation.id)
    }
    
    fun loadConversationMessages(conversationId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            chatRepository.getConversationMessages(conversationId)
                .onSuccess { messages ->
                    _uiState.value = _uiState.value.copy(
                        messages = messages,
                        isLoading = false
                    )
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message
                    )
                }
        }
    }
    
    fun sendConversationMessage(content: String) {
        val conversationId = _uiState.value.activeConversation?.id ?: return
        
        viewModelScope.launch {
            val message = MessageSend(conversationId = conversationId, content = content)
            
            chatRepository.sendMessage(message)
                .onSuccess {
                    loadConversationMessages(conversationId)
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(error = exception.message)
                }
        }
    }
    
    // ===== Groups =====
    
    fun loadGroups() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            chatRepository.getGroups()
                .onSuccess { groups ->
                    _uiState.value = _uiState.value.copy(
                        groups = groups,
                        isLoading = false
                    )
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message
                    )
                }
        }
    }
    
    fun createGroup(name: String, description: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            chatRepository.createGroup(GroupCreate(name, description))
                .onSuccess {
                    loadGroups()
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message
                    )
                }
        }
    }
    
    fun selectGroup(group: Group) {
        _uiState.value = _uiState.value.copy(
            activeGroup = group,
            activeConversation = null,
            messages = emptyList(),
            groupMembers = emptyList()
        )
        loadGroupMessages(group.id)
        loadGroupMembers(group.id)
    }
    
    fun loadGroupMessages(groupId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            chatRepository.getGroupMessages(groupId)
                .onSuccess { messages ->
                    _uiState.value = _uiState.value.copy(
                        messages = messages,
                        isLoading = false
                    )
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message
                    )
                }
        }
    }
    
    fun loadGroupMembers(groupId: String) {
        viewModelScope.launch {
            chatRepository.getGroupMembers(groupId)
                .onSuccess { members ->
                    _uiState.value = _uiState.value.copy(groupMembers = members)
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(error = exception.message)
                }
        }
    }
    
    fun sendGroupMessage(content: String) {
        val groupId = _uiState.value.activeGroup?.id ?: return
        
        viewModelScope.launch {
            val message = MessageSend(groupId = groupId, content = content)
            
            chatRepository.sendMessage(message)
                .onSuccess {
                    loadGroupMessages(groupId)
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(error = exception.message)
                }
        }
    }
    
    fun addMember(username: String) {
        val groupId = _uiState.value.activeGroup?.id ?: return
        
        viewModelScope.launch {
            chatRepository.addGroupMember(groupId, username)
                .onSuccess {
                    loadGroupMembers(groupId)
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(error = exception.message)
                }
        }
    }
    
    fun removeMember(username: String) {
        val groupId = _uiState.value.activeGroup?.id ?: return
        
        viewModelScope.launch {
            chatRepository.removeGroupMember(groupId, username)
                .onSuccess {
                    loadGroupMembers(groupId)
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(error = exception.message)
                }
        }
    }
    
    fun deleteGroup() {
        val groupId = _uiState.value.activeGroup?.id ?: return
        
        viewModelScope.launch {
            chatRepository.deleteGroup(groupId)
                .onSuccess {
                    _uiState.value = _uiState.value.copy(activeGroup = null)
                    loadGroups()
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(error = exception.message)
                }
        }
    }
    
    fun clearActiveChat() {
        _uiState.value = _uiState.value.copy(
            activeConversation = null,
            activeGroup = null,
            messages = emptyList(),
            groupMembers = emptyList()
        )
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
