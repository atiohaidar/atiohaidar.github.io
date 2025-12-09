package com.example.portoflio_android.data.repository

import com.example.portoflio_android.data.models.*
import com.example.portoflio_android.data.network.api.ItemApiService
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ItemRepository @Inject constructor(
    private val apiService: ItemApiService
) {
    suspend fun getItems(owner: String? = null): Result<List<Item>> {
        return try {
            val response = apiService.getItems(owner)
            if (response.success) {
                Result.success(response.data)
            } else {
                Result.failure(Exception("Failed to get items"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createItem(name: String, description: String?, stock: Int): Result<Item> {
        return try {
            val response = apiService.createItem(ItemCreate(name, description, stock, null))
            if (response.success) {
                Result.success(response.data)
            } else {
                Result.failure(Exception("Failed to create item"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateItem(itemId: String, updates: ItemUpdate): Result<Item> {
        return try {
            val response = apiService.updateItem(itemId, updates)
            if (response.success) {
                Result.success(response.data)
            } else {
                Result.failure(Exception("Failed to update item"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteItem(itemId: String): Result<Item> {
        return try {
            val response = apiService.deleteItem(itemId)
            if (response.success) {
                Result.success(response.data)
            } else {
                Result.failure(Exception("Failed to delete item"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getItemBorrowings(itemId: String? = null, status: String? = null): Result<List<ItemBorrowing>> {
        return try {
            val response = apiService.getItemBorrowings(itemId, status)
            if (response.success) {
                Result.success(response.data)
            } else {
                Result.failure(Exception("Failed to get borrowings"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createItemBorrowing(borrowing: ItemBorrowingCreate): Result<ItemBorrowing> {
        return try {
            val response = apiService.createItemBorrowing(borrowing)
            if (response.success) {
                Result.success(response.data)
            } else {
                Result.failure(Exception("Failed to create borrowing"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateBorrowingStatus(borrowingId: String, status: ItemBorrowingStatus, notes: String? = null): Result<ItemBorrowing> {
        return try {
            val response = apiService.updateItemBorrowingStatus(borrowingId, ItemBorrowingUpdateStatus(status, notes))
            if (response.success) {
                Result.success(response.data)
            } else {
                Result.failure(Exception("Failed to update borrowing status"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
