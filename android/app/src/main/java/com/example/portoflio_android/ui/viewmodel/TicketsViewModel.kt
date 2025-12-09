package com.example.portoflio_android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.portoflio_android.data.models.Ticket
import com.example.portoflio_android.data.models.TicketCategory
import com.example.portoflio_android.data.models.TicketComment
import com.example.portoflio_android.data.network.api.TicketStats
import com.example.portoflio_android.data.repository.TicketRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class TicketsUiState(
    val tickets: List<Ticket> = emptyList(),
    val categories: List<TicketCategory> = emptyList(),
    val comments: List<TicketComment> = emptyList(),
    val stats: TicketStats? = null,
    val selectedTicket: Ticket? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class TicketsViewModel @Inject constructor(
    private val ticketRepository: TicketRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(TicketsUiState())
    val uiState: StateFlow<TicketsUiState> = _uiState.asStateFlow()
    
    init {
        loadCategories()
        loadTickets()
        loadStats()
    }
    
    fun loadCategories() {
        viewModelScope.launch {
            ticketRepository.getCategories()
                .onSuccess { categories ->
                    _uiState.value = _uiState.value.copy(categories = categories)
                }
        }
    }
    
    fun loadTickets(status: String? = null, categoryId: Int? = null) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            ticketRepository.getTickets(status, categoryId)
                .onSuccess { tickets ->
                    _uiState.value = _uiState.value.copy(
                        tickets = tickets,
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
    
    fun loadStats() {
        viewModelScope.launch {
            ticketRepository.getStats()
                .onSuccess { stats ->
                    _uiState.value = _uiState.value.copy(stats = stats)
                }
        }
    }
    
    fun selectTicket(ticket: Ticket) {
        _uiState.value = _uiState.value.copy(selectedTicket = ticket)
        loadComments(ticket.id)
    }
    
    fun loadComments(ticketId: Int) {
        viewModelScope.launch {
            ticketRepository.getComments(ticketId)
                .onSuccess { comments ->
                    _uiState.value = _uiState.value.copy(comments = comments)
                }
        }
    }
    
    fun addComment(ticketId: Int, text: String) {
        viewModelScope.launch {
            ticketRepository.addComment(ticketId, text)
                .onSuccess {
                    loadComments(ticketId)
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(error = exception.message)
                }
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
    
    fun clearSelectedTicket() {
        _uiState.value = _uiState.value.copy(selectedTicket = null, comments = emptyList())
    }
}
