package com.example.portoflio_android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.portoflio_android.data.models.*
import com.example.portoflio_android.data.repository.ItemRepository
import com.example.portoflio_android.data.local.TokenManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ItemsUiState(
    val items: List<Item> = emptyList(),
    val borrowings: List<ItemBorrowing> = emptyList(),
    val currentUser: User? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class ItemsViewModel @Inject constructor(
    private val repository: ItemRepository,
    private val tokenManager: TokenManager
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(ItemsUiState())
    val uiState: StateFlow<ItemsUiState> = _uiState.asStateFlow()
    
    init {
        loadCurrentUser()
        loadItems()
    }
    
    private fun loadCurrentUser() {
        viewModelScope.launch {
            val user = tokenManager.getUser()
            _uiState.value = _uiState.value.copy(currentUser = user)
        }
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
                    loadItems() // Refresh items as stock may have changed
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to update borrowing status",
                        isLoading = false
                    )
                }
        }
    }
    
    fun createBorrowing(itemId: String, quantity: Int, startDate: String, endDate: String, notes: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val borrowingCreate = ItemBorrowingCreate(
                itemId = itemId,
                quantity = quantity,
                startDate = startDate,
                endDate = endDate,
                notes = notes
            )
            repository.createItemBorrowing(borrowingCreate)
                .onSuccess {
                    loadItems()
                    loadBorrowings()
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to create borrowing request",
                        isLoading = false
                    )
                }
        }
    }
    
    fun cancelBorrowing(borrowingId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                // Use the API service through repository pattern - for now we use cancelled status approach
                updateBorrowingStatus(borrowingId, ItemBorrowingStatus.REJECTED)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = e.message ?: "Failed to cancel borrowing",
                    isLoading = false
                )
            }
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
