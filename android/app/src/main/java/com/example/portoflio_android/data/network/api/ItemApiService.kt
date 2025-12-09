package com.example.portoflio_android.data.network.api

import com.example.portoflio_android.data.models.*
import retrofit2.http.*

/**
 * Item API service for item/inventory management.
 */
interface ItemApiService {
    
    @GET("/api/items")
    suspend fun getItems(@Query("owner") owner: String? = null): ItemsListResponse
    
    @GET("/api/items/{itemId}")
    suspend fun getItem(@Path("itemId") itemId: String): ItemResponse
    
    @POST("/api/items")
    suspend fun createItem(@Body item: ItemCreate): ItemResponse
    
    @PUT("/api/items/{itemId}")
    suspend fun updateItem(
        @Path("itemId") itemId: String,
        @Body updates: ItemUpdate
    ): ItemResponse
    
    @DELETE("/api/items/{itemId}")
    suspend fun deleteItem(@Path("itemId") itemId: String): ItemResponse
    
    // Item Borrowings
    @GET("/api/item-borrowings")
    suspend fun getItemBorrowings(
        @Query("itemId") itemId: String? = null,
        @Query("status") status: String? = null
    ): ItemBorrowingsListResponse
    
    @GET("/api/item-borrowings/{borrowingId}")
    suspend fun getItemBorrowing(@Path("borrowingId") borrowingId: String): ItemBorrowingResponse
    
    @POST("/api/item-borrowings")
    suspend fun createItemBorrowing(@Body borrowing: ItemBorrowingCreate): ItemBorrowingResponse
    
    @PUT("/api/item-borrowings/{borrowingId}/status")
    suspend fun updateItemBorrowingStatus(
        @Path("borrowingId") borrowingId: String,
        @Body updates: ItemBorrowingUpdateStatus
    ): ItemBorrowingResponse
    
    @DELETE("/api/item-borrowings/{borrowingId}")
    suspend fun cancelItemBorrowing(@Path("borrowingId") borrowingId: String): ItemBorrowingResponse
}
