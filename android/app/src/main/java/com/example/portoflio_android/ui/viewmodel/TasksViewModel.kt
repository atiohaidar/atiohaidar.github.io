package com.example.portoflio_android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.portoflio_android.data.models.Task
import com.example.portoflio_android.data.models.TaskCreate
import com.example.portoflio_android.data.models.TaskUpdate
import com.example.portoflio_android.data.repository.TaskRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class TasksUiState(
    val tasks: List<Task> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val isRefreshing: Boolean = false
)

@HiltViewModel
class TasksViewModel @Inject constructor(
    private val taskRepository: TaskRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(TasksUiState())
    val uiState: StateFlow<TasksUiState> = _uiState.asStateFlow()
    
    init {
        loadTasks()
    }
    
    fun loadTasks(isCompleted: Boolean? = null) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            taskRepository.getTasks(isCompleted = isCompleted)
                .onSuccess { tasks ->
                    _uiState.value = _uiState.value.copy(
                        tasks = tasks,
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
    
    fun refresh() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isRefreshing = true)
            
            taskRepository.getTasks()
                .onSuccess { tasks ->
                    _uiState.value = _uiState.value.copy(
                        tasks = tasks,
                        isRefreshing = false
                    )
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isRefreshing = false,
                        error = exception.message
                    )
                }
        }
    }
    
    fun createTask(name: String, description: String?, dueDate: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val taskCreate = TaskCreate(
                name = name,
                description = description,
                dueDate = dueDate
            )
            
            taskRepository.createTask(taskCreate)
                .onSuccess {
                    loadTasks() // Reload after creating
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message
                    )
                }
        }
    }
    
    fun toggleTaskCompletion(task: Task) {
        viewModelScope.launch {
            val update = TaskUpdate(completed = !task.completed)
            
            taskRepository.updateTask(task.id, update)
                .onSuccess {
                    loadTasks() // Reload after updating
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(error = exception.message)
                }
        }
    }
    
    fun deleteTask(taskId: Int) {
        viewModelScope.launch {
            taskRepository.deleteTask(taskId)
                .onSuccess {
                    loadTasks() // Reload after deleting
                }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(error = exception.message)
                }
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
