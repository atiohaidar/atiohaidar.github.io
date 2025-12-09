package com.example.portoflio_android.data.models

import com.google.gson.annotations.SerializedName

/**
 * Item data classes for item/inventory management.
 */
data class Item(
    val id: String,
    val name: String,
    val description: String? = null,
    val stock: Int,
    @SerializedName("attachment_link")
    val attachmentLink: String? = null,
    @SerializedName("owner_username")
    val ownerUsername: String,
    @SerializedName("created_at")
    val createdAt: String? = null,
    @SerializedName("updated_at")
    val updatedAt: String? = null
)

data class ItemCreate(
    val name: String,
    val description: String? = null,
    val stock: Int,
    @SerializedName("attachment_link")
    val attachmentLink: String? = null
)

data class ItemUpdate(
    val name: String? = null,
    val description: String? = null,
    val stock: Int? = null,
    @SerializedName("attachment_link")
    val attachmentLink: String? = null
)

enum class ItemBorrowingStatus {
    @SerializedName("pending")
    PENDING,
    @SerializedName("approved")
    APPROVED,
    @SerializedName("rejected")
    REJECTED,
    @SerializedName("returned")
    RETURNED,
    @SerializedName("damaged")
    DAMAGED,
    @SerializedName("extended")
    EXTENDED
}

data class ItemBorrowing(
    val id: String,
    @SerializedName("item_id")
    val itemId: String,
    @SerializedName("borrower_username")
    val borrowerUsername: String,
    val quantity: Int,
    @SerializedName("start_date")
    val startDate: String,
    @SerializedName("end_date")
    val endDate: String,
    val status: ItemBorrowingStatus,
    val notes: String? = null,
    @SerializedName("created_at")
    val createdAt: String? = null,
    @SerializedName("updated_at")
    val updatedAt: String? = null
)

data class ItemBorrowingCreate(
    @SerializedName("item_id")
    val itemId: String,
    val quantity: Int,
    @SerializedName("start_date")
    val startDate: String,
    @SerializedName("end_date")
    val endDate: String,
    val notes: String? = null
)

data class ItemBorrowingUpdateStatus(
    val status: ItemBorrowingStatus,
    val notes: String? = null
)

// API Response wrappers
data class ItemsListResponse(
    val success: Boolean,
    val data: List<Item>
)

data class ItemResponse(
    val success: Boolean,
    val data: Item
)

data class ItemBorrowingsListResponse(
    val success: Boolean,
    val data: List<ItemBorrowing>
)

data class ItemBorrowingResponse(
    val success: Boolean,
    val data: ItemBorrowing
)
