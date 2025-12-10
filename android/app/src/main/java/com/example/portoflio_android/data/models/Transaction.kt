package com.example.portoflio_android.data.models

import com.google.gson.annotations.SerializedName

/**
 * Transaction data models for wallet/finance
 */
enum class TransactionType {
    @SerializedName("topup")
    TOPUP,
    @SerializedName("transfer")
    TRANSFER,
    @SerializedName("receive")
    RECEIVE,
    @SerializedName("withdrawal")
    WITHDRAWAL
}

data class Transaction(
    val id: String,
    val type: TransactionType,
    val amount: Double,
    @SerializedName("from_username")
    val fromUsername: String? = null,
    @SerializedName("to_username")
    val toUsername: String? = null,
    val description: String? = null,
    val balance: Double? = null,
    @SerializedName("created_at")
    val createdAt: String? = null
)

data class TransactionsResponse(
    val transactions: List<Transaction>
)
