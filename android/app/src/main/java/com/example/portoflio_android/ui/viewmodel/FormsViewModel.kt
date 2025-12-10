package com.example.portoflio_android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.portoflio_android.data.models.*
import com.example.portoflio_android.data.repository.FormRepository
import com.example.portoflio_android.data.local.TokenManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class FormsUiState(
    val forms: List<Form> = emptyList(),
    val selectedForm: FormWithQuestions? = null,
    val responses: List<FormResponse> = emptyList(),
    val currentUser: User? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class FormsViewModel @Inject constructor(
    private val repository: FormRepository,
    private val tokenManager: TokenManager
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(FormsUiState())
    val uiState: StateFlow<FormsUiState> = _uiState.asStateFlow()
    
    init {
        loadCurrentUser()
        loadForms()
    }
    
    private fun loadCurrentUser() {
        viewModelScope.launch {
            val user = tokenManager.getUser()
            _uiState.value = _uiState.value.copy(currentUser = user)
        }
    }
    
    fun loadForms() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            repository.getForms()
                .onSuccess { forms ->
                    _uiState.value = _uiState.value.copy(
                        forms = forms,
                        isLoading = false
                    )
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to load forms",
                        isLoading = false
                    )
                }
        }
    }
    
    fun selectForm(form: Form) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            repository.getForm(form.id)
                .onSuccess { formWithQuestions ->
                    _uiState.value = _uiState.value.copy(
                        selectedForm = formWithQuestions,
                        isLoading = false
                    )
                    loadFormResponses(form.id)
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to load form",
                        isLoading = false
                    )
                }
        }
    }
    
    fun loadFormResponses(formId: String) {
        viewModelScope.launch {
            repository.getFormResponses(formId)
                .onSuccess { responses ->
                    _uiState.value = _uiState.value.copy(responses = responses)
                }
        }
    }
    
    fun createForm(title: String, description: String?, questions: List<FormQuestionCreate>) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            repository.createForm(title, description, questions)
                .onSuccess {
                    loadForms()
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to create form",
                        isLoading = false
                    )
                }
        }
    }
    
    fun deleteForm(formId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            repository.deleteForm(formId)
                .onSuccess {
                    loadForms()
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to delete form",
                        isLoading = false
                    )
                }
        }
    }
    
    fun clearSelectedForm() {
        _uiState.value = _uiState.value.copy(selectedForm = null, responses = emptyList())
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
