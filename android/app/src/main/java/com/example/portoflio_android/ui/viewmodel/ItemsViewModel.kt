package com.example.portoflio_android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.portoflio_android.data.models.*
import com.example.portoflio_android.data.repository.ItemRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ItemsUiState(
    val items: List<Item> = emptyList(),
    val borrowings: List<ItemBorrowing> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class ItemsViewModel @Inject constructor(
    private val repository: ItemRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(ItemsUiState())
    val uiState: StateFlow<ItemsUiState> = _uiState.asStateFlow()
    
    init {
        loadItems()
    }
    
    fun loadItems() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            repository.getItems()
                .onSuccess { items ->
                    _uiState.value = _uiState.value.copy(
                        items = items,
                        isLoading = false
                    )
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to load items",
                        isLoading = false
                    )
                }
        }
    }
    
    fun loadBorrowings(itemId: String? = null) {
        viewModelScope.launch {
            repository.getItemBorrowings(itemId)
                .onSuccess { borrowings ->
                    _uiState.value = _uiState.value.copy(borrowings = borrowings)
                }
        }
    }
    
    fun createItem(name: String, description: String?, stock: Int) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            repository.createItem(name, description, stock)
                .onSuccess {
                    loadItems()
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to create item",
                        isLoading = false
                    )
                }
        }
    }
    
    fun updateItemStock(itemId: String, newStock: Int) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            repository.updateItem(itemId, ItemUpdate(stock = newStock))
                .onSuccess {
                    loadItems()
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to update item",
                        isLoading = false
                    )
                }
        }
    }
    
    fun deleteItem(itemId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            repository.deleteItem(itemId)
                .onSuccess {
                    loadItems()
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to delete item",
                        isLoading = false
                    )
                }
        }
    }
    
    fun approveBorrowing(borrowingId: String) {
        updateBorrowingStatus(borrowingId, ItemBorrowingStatus.APPROVED)
    }
    
    fun rejectBorrowing(borrowingId: String) {
        updateBorrowingStatus(borrowingId, ItemBorrowingStatus.REJECTED)
    }
    
    fun markAsReturned(borrowingId: String) {
        updateBorrowingStatus(borrowingId, ItemBorrowingStatus.RETURNED)
    }
    
    private fun updateBorrowingStatus(borrowingId: String, status: ItemBorrowingStatus) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            repository.updateBorrowingStatus(borrowingId, status)
                .onSuccess {
                    loadBorrowings()
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to update borrowing status",
                        isLoading = false
                    )
                }
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
