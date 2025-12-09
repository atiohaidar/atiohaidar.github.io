package com.example.portoflio_android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.portoflio_android.data.local.TokenManager
import com.example.portoflio_android.data.models.User
import com.example.portoflio_android.data.repository.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProfileUiState(
    val user: User? = null,
    val isLoading: Boolean = false,
    val isUpdating: Boolean = false,
    val updateSuccess: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val userRepository: UserRepository,
    private val tokenManager: TokenManager
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()
    
    init {
        loadProfile()
    }
    
    fun loadProfile() {
        viewModelScope.launch {
            // Get user from TokenManager (stored during login)
            val user = tokenManager.getUser()
            _uiState.value = _uiState.value.copy(user = user, isLoading = false)
        }
    }
    
    fun updateProfile(name: String?, password: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isUpdating = true, error = null, updateSuccess = false)
            
            userRepository.updateProfile(name, password)
                .onSuccess { user ->
                    // Update stored user in TokenManager
                    tokenManager.saveUser(user)
                    _uiState.value = _uiState.value.copy(
                        user = user,
                        isUpdating = false,
                        updateSuccess = true
                    )
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isUpdating = false,
                        error = exception.message
                    )
                }
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
    
    fun clearUpdateSuccess() {
        _uiState.value = _uiState.value.copy(updateSuccess = false)
    }
}

