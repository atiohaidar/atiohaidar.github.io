package com.example.portoflio_android.data.network.api

import com.example.portoflio_android.data.models.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Article API service for CRUD operations.
 */
interface ArticleApiService {
    
    @GET("/api/articles")
    suspend fun getArticles(
        @Query("page") page: Int? = null,
        @Query("published") published: Boolean? = null
    ): Response<ArticlesListResponse>
    
    @GET("/api/articles/{slug}")
    suspend fun getArticle(@Path("slug") slug: String): Response<ApiResponse<Article>>
    
    @POST("/api/articles")
    suspend fun createArticle(@Body article: ArticleCreate): Response<ApiResponse<Article>>
    
    @PUT("/api/articles/{slug}")
    suspend fun updateArticle(
        @Path("slug") slug: String,
        @Body article: ArticleUpdate
    ): Response<ApiResponse<Article>>
    
    @DELETE("/api/articles/{slug}")
    suspend fun deleteArticle(@Path("slug") slug: String): Response<ApiResponse<Article>>
    
    // Public articles (no auth required)
    @GET("/api/public/articles")
    suspend fun getPublicArticles(): Response<ArticlesListResponse>
    
    @GET("/api/public/articles/{slug}")
    suspend fun getPublicArticle(@Path("slug") slug: String): Response<ApiResponse<Article>>
}
