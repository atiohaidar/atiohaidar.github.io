package com.example.portoflio_android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.portoflio_android.data.models.DashboardStats
import com.example.portoflio_android.data.repository.StatsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DashboardUiState(
    val stats: DashboardStats? = null,
    val user: com.example.portoflio_android.data.models.User? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val statsRepository: StatsRepository,
    private val userRepository: com.example.portoflio_android.data.repository.UserRepository,
    private val authRepository: com.example.portoflio_android.data.repository.AuthRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()
    
    init {
        loadData()
    }
    
    fun loadData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            // Fetch stats
            launch {
                statsRepository.getStats()
                    .onSuccess { stats ->
                        _uiState.value = _uiState.value.copy(stats = stats)
                    }
                    .onFailure { exception ->
                         // Handle error or just log
                    }
            }

            // Fetch user
            val currentUser = authRepository.getCurrentUser()
            if (currentUser != null) {
                userRepository.getUser(currentUser.username)
                    .onSuccess { user ->
                        _uiState.value = _uiState.value.copy(user = user)
                        // Update cached user if possible, but simplified here
                    }
            }
            
             _uiState.value = _uiState.value.copy(isLoading = false)
        }
    }
    
    fun refresh() {
        loadData()
    }
}
