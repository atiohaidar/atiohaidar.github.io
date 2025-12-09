package com.example.portoflio_android.data.models

import com.google.gson.annotations.SerializedName

/**
 * Article data class for blog/article management.
 */
data class Article(
    val slug: String,
    val title: String,
    val content: String,
    val published: Boolean = false,
    val owner: String? = null,
    @SerializedName("created_at")
    val createdAt: String? = null,
    @SerializedName("updated_at")
    val updatedAt: String? = null
)

data class ArticleCreate(
    val slug: String,
    val title: String,
    val content: String,
    val published: Boolean? = null
)

data class ArticleUpdate(
    val title: String? = null,
    val content: String? = null,
    val published: Boolean? = null
)
