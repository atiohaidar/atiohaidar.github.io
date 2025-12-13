package com.example.portoflio_android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.portoflio_android.data.models.AnonymousMessage
import com.example.portoflio_android.data.repository.AnonymousChatRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AnonymousChatUiState(
    val messages: List<AnonymousMessage> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class AnonymousChatViewModel @Inject constructor(
    private val anonymousChatRepository: AnonymousChatRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(AnonymousChatUiState())
    val uiState: StateFlow<AnonymousChatUiState> = _uiState.asStateFlow()
    
    init {
        loadMessages()
    }
    
    fun loadMessages() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            anonymousChatRepository.getMessages()
                .onSuccess { messages ->
                    _uiState.value = _uiState.value.copy(
                        messages = messages,
                        isLoading = false
                    )
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message ?: "Gagal memuat pesan"
                    )
                }
        }
    }
    
    fun sendMessage(content: String, senderName: String?) {
        viewModelScope.launch {
            anonymousChatRepository.sendMessage(content, senderName)
                .onSuccess {
                    loadMessages()
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(error = exception.message ?: "Gagal mengirim pesan")
                }
        }
    }
    
    fun deleteAllMessages() {
        viewModelScope.launch {
            anonymousChatRepository.deleteAllMessages()
                .onSuccess {
                    loadMessages()
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(error = exception.message ?: "Gagal menghapus pesan")
                }
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
