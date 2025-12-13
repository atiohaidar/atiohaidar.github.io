package com.example.portoflio_android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.portoflio_android.data.local.TokenManager
import com.example.portoflio_android.data.models.Event
import com.example.portoflio_android.data.models.EventAttendee
import com.example.portoflio_android.data.models.User
import com.example.portoflio_android.data.models.UserRole
import com.example.portoflio_android.data.repository.EventRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class EventsUiState(
    val events: List<Event> = emptyList(),
    val attendees: List<EventAttendee> = emptyList(),
    val selectedEvent: Event? = null,
    val currentUser: User? = null,
    val isLoading: Boolean = false,
    val showAttendeesSheet: Boolean = false,
    val scanResult: String? = null,
    val error: String? = null
)

@HiltViewModel
class EventsViewModel @Inject constructor(
    private val eventRepository: EventRepository,
    private val tokenManager: TokenManager
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(EventsUiState())
    val uiState: StateFlow<EventsUiState> = _uiState.asStateFlow()
    
    init {
        loadCurrentUser()
        loadEvents()
    }
    
    private fun loadCurrentUser() {
        viewModelScope.launch {
            val user = tokenManager.getUser()
            _uiState.value = _uiState.value.copy(currentUser = user)
        }
    }
    
    fun loadEvents() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            eventRepository.getEvents()
                .onSuccess { events ->
                    _uiState.value = _uiState.value.copy(
                        events = events,
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
    
    fun registerForEvent(eventId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            eventRepository.registerForEvent(eventId)
                .onSuccess {
                    loadEvents()
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message
                    )
                }
        }
    }
    
    fun showAttendees(event: Event) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                selectedEvent = event,
                showAttendeesSheet = true,
                isLoading = true
            )
            
            eventRepository.getAttendees(event.id)
                .onSuccess { attendees ->
                    _uiState.value = _uiState.value.copy(
                        attendees = attendees,
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
    
    fun hideAttendees() {
        _uiState.value = _uiState.value.copy(
            showAttendeesSheet = false,
            selectedEvent = null,
            attendees = emptyList()
        )
    }
    
    fun createEvent(title: String, description: String?, eventDate: String, location: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val eventCreate = com.example.portoflio_android.data.models.EventCreate(
                title = title,
                description = description,
                eventDate = eventDate,
                location = location
            )
            
            eventRepository.createEvent(eventCreate)
                .onSuccess {
                    loadEvents()
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message
                    )
                }
        }
    }
    
    fun deleteEvent(eventId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            eventRepository.deleteEvent(eventId)
                .onSuccess {
                    loadEvents()
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message
                    )
                }
        }
    }
    
    fun canModifyEvent(event: Event): Boolean {
        val currentUser = _uiState.value.currentUser ?: return false
        return currentUser.role == UserRole.ADMIN || currentUser.username == event.createdBy
    }
    
    fun scanAttendance(eventId: String, token: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            eventRepository.scanAttendance(eventId, token)
                .onSuccess { scan ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        scanResult = "Absensi berhasil dicatat!"
                    )
                    // Refresh attendees if we're viewing them
                    _uiState.value.selectedEvent?.let { showAttendees(it) }
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message
                    )
                }
        }
    }
    
    fun clearScanResult() {
        _uiState.value = _uiState.value.copy(scanResult = null)
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
