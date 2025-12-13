package com.example.portoflio_android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.portoflio_android.data.models.Booking
import com.example.portoflio_android.data.models.BookingCreate
import com.example.portoflio_android.data.models.Room
import com.example.portoflio_android.data.repository.RoomRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class RoomsUiState(
    val rooms: List<Room> = emptyList(),
    val bookings: List<Booking> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class RoomsViewModel @Inject constructor(
    private val roomRepository: RoomRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(RoomsUiState())
    val uiState: StateFlow<RoomsUiState> = _uiState.asStateFlow()
    
    init {
        loadRooms()
        loadBookings()
    }
    
    fun loadRooms(available: Boolean? = null) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            roomRepository.getRooms(available)
                .onSuccess { rooms ->
                    _uiState.value = _uiState.value.copy(
                        rooms = rooms,
                        isLoading = false
                    )
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message ?: "Gagal memuat ruangan"
                    )
                }
        }
    }
    
    fun loadBookings(roomId: String? = null, status: String? = null) {
        viewModelScope.launch {
            roomRepository.getBookings(roomId, status)
                .onSuccess { bookings ->
                    _uiState.value = _uiState.value.copy(bookings = bookings)
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(error = exception.message ?: "Gagal memuat jadwal")
                }
        }
    }
    
    fun createBooking(roomId: String, startTime: String, endTime: String, purpose: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val booking = BookingCreate(
                roomId = roomId,
                startTime = startTime,
                endTime = endTime,
                purpose = purpose
            )
            
            roomRepository.createBooking(booking)
                .onSuccess {
                    loadBookings() // Reload after creating
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message ?: "Gagal membuat reservasi"
                    )
                }
        }
    }
    
    fun cancelBooking(bookingId: String) {
        viewModelScope.launch {
            roomRepository.cancelBooking(bookingId)
                .onSuccess {
                    loadBookings() // Reload after canceling
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(error = exception.message ?: "Gagal membatalkan reservasi")
                }
        }
    }
    
    fun refresh() {
        loadRooms()
        loadBookings()
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
