package com.example.portoflio_android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.portoflio_android.data.models.*
import com.example.portoflio_android.data.repository.DiscussionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DiscussionsUiState(
    val discussions: List<Discussion> = emptyList(),
    val activeDiscussion: Discussion? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class DiscussionsViewModel @Inject constructor(
    private val discussionRepository: DiscussionRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(DiscussionsUiState())
    val uiState: StateFlow<DiscussionsUiState> = _uiState.asStateFlow()
    
    init {
        loadDiscussions()
    }
    
    fun loadDiscussions() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            discussionRepository.getDiscussions()
                .onSuccess { discussions ->
                    _uiState.value = _uiState.value.copy(
                        discussions = discussions,
                        isLoading = false
                    )
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message ?: "Gagal memuat diskusi"
                    )
                }
        }
    }
    
    fun selectDiscussion(discussion: Discussion) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            discussionRepository.getDiscussion(discussion.id)
                .onSuccess { fullDiscussion ->
                    _uiState.value = _uiState.value.copy(
                        activeDiscussion = fullDiscussion,
                        isLoading = false
                    )
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message ?: "Gagal memuat detail diskusi"
                    )
                }
        }
    }
    
    fun clearActiveDiscussion() {
        _uiState.value = _uiState.value.copy(activeDiscussion = null)
    }
    
    fun createDiscussion(title: String, content: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            discussionRepository.createDiscussion(DiscussionCreate(title, content))
                .onSuccess {
                    loadDiscussions()
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message ?: "Gagal membuat diskusi"
                    )
                }
        }
    }
    
    fun createReply(content: String) {
        val discussionId = _uiState.value.activeDiscussion?.id ?: return
        
        viewModelScope.launch {
            discussionRepository.createReply(discussionId, content)
                .onSuccess {
                    // Reload discussion to get updated replies
                    selectDiscussion(_uiState.value.activeDiscussion!!)
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(error = exception.message ?: "Gagal mengirim balasan")
                }
        }
    }
    
    fun deleteDiscussion(discussionId: String) {
        viewModelScope.launch {
            discussionRepository.deleteDiscussion(discussionId)
                .onSuccess {
                    _uiState.value = _uiState.value.copy(activeDiscussion = null)
                    loadDiscussions()
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(error = exception.message ?: "Gagal menghapus diskusi")
                }
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
