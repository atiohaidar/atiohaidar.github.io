package com.example.portoflio_android.data.repository

import com.example.portoflio_android.data.models.*
import com.example.portoflio_android.data.network.api.ArticleApiService
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Article repository for article management.
 */
@Singleton
class ArticleRepository @Inject constructor(
    private val articleApiService: ArticleApiService
) {
    
    suspend fun getArticles(published: Boolean? = null): Result<List<Article>> {
        return try {
            val response = articleApiService.getArticles(published = published)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.articles)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get articles"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getArticle(slug: String): Result<Article> {
        return try {
            val response = articleApiService.getArticle(slug)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get article"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createArticle(article: ArticleCreate): Result<Article> {
        return try {
            val response = articleApiService.createArticle(article)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to create article"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateArticle(slug: String, update: ArticleUpdate): Result<Article> {
        return try {
            val response = articleApiService.updateArticle(slug, update)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update article"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteArticle(slug: String): Result<Unit> {
        return try {
            val response = articleApiService.deleteArticle(slug)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to delete article"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
