package com.example.portoflio_android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.portoflio_android.data.models.User
import com.example.portoflio_android.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class AuthState {
    object Initial : AuthState()
    object Loading : AuthState()
    data class Authenticated(val user: User) : AuthState()
    object Unauthenticated : AuthState()
    data class Error(val message: String) : AuthState()
}

sealed class RegisterState {
    object Idle : RegisterState()
    object Loading : RegisterState()
    data class Success(val message: String) : RegisterState()
    data class Error(val message: String) : RegisterState()
}

sealed class ForgotPasswordState {
    object Idle : ForgotPasswordState()
    object Loading : ForgotPasswordState()
    data class Success(val message: String) : ForgotPasswordState()
    data class Error(val message: String) : ForgotPasswordState()
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _authState = MutableStateFlow<AuthState>(AuthState.Initial)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()
    
    private val _registerState = MutableStateFlow<RegisterState>(RegisterState.Idle)
    val registerState: StateFlow<RegisterState> = _registerState.asStateFlow()
    
    private val _forgotPasswordState = MutableStateFlow<ForgotPasswordState>(ForgotPasswordState.Idle)
    val forgotPasswordState: StateFlow<ForgotPasswordState> = _forgotPasswordState.asStateFlow()
    
    init {
        checkAuthStatus()
    }
    
    private fun checkAuthStatus() {
        viewModelScope.launch {
            val user = authRepository.getCurrentUser()
            _authState.value = if (user != null) {
                AuthState.Authenticated(user)
            } else {
                AuthState.Unauthenticated
            }
        }
    }
    
    fun login(username: String, password: String) {
        if (username.isBlank() || password.isBlank()) {
            _authState.value = AuthState.Error("Username dan password diperlukan")
            return
        }
        
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            
            authRepository.login(username, password)
                .onSuccess { loginResponse ->
                    _authState.value = AuthState.Authenticated(loginResponse.user)
                }
                .onFailure { exception ->
                    _authState.value = AuthState.Error(exception.message ?: "Login gagal")
                }
        }
    }
    
    fun register(username: String, name: String, password: String) {
        if (username.isBlank() || name.isBlank() || password.isBlank()) {
            _registerState.value = RegisterState.Error("Semua kolom wajib diisi")
            return
        }
        
        if (password.length < 6) {
            _registerState.value = RegisterState.Error("Password minimal 6 karakter")
            return
        }
        
        viewModelScope.launch {
            _registerState.value = RegisterState.Loading
            
            authRepository.register(username, name, password)
                .onSuccess { response ->
                    _registerState.value = RegisterState.Success("Registrasi berhasil")
                }
                .onFailure { exception ->
                    _registerState.value = RegisterState.Error(exception.message ?: "Registrasi gagal")
                }
        }
    }
    
    fun forgotPassword(username: String, newPassword: String) {
        if (username.isBlank() || newPassword.isBlank()) {
            _forgotPasswordState.value = ForgotPasswordState.Error("Semua kolom wajib diisi")
            return
        }
        
        if (newPassword.length < 6) {
            _forgotPasswordState.value = ForgotPasswordState.Error("Password minimal 6 karakter")
            return
        }
        
        viewModelScope.launch {
            _forgotPasswordState.value = ForgotPasswordState.Loading
            
            authRepository.forgotPassword(username, newPassword)
                .onSuccess { response ->
                    _forgotPasswordState.value = ForgotPasswordState.Success("Permintaan reset password berhasil, silakan cek email Anda")
                }
                .onFailure { exception ->
                    _forgotPasswordState.value = ForgotPasswordState.Error(exception.message ?: "Reset password gagal")
                }
        }
    }
    
    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _authState.value = AuthState.Unauthenticated
        }
    }
    
    fun clearError() {
        if (_authState.value is AuthState.Error) {
            _authState.value = AuthState.Unauthenticated
        }
    }
    
    fun resetRegisterState() {
        _registerState.value = RegisterState.Idle
    }
    
    fun resetForgotPasswordState() {
        _forgotPasswordState.value = ForgotPasswordState.Idle
    }
}
