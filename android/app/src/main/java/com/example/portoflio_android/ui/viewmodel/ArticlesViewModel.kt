package com.example.portoflio_android.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.portoflio_android.data.models.Article
import com.example.portoflio_android.data.models.ArticleCreate
import com.example.portoflio_android.data.repository.ArticleRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ArticlesUiState(
    val articles: List<Article> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class ArticlesViewModel @Inject constructor(
    private val articleRepository: ArticleRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(ArticlesUiState())
    val uiState: StateFlow<ArticlesUiState> = _uiState.asStateFlow()
    
    init {
        loadArticles()
    }
    
    fun loadArticles(published: Boolean? = null) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            articleRepository.getArticles(published)
                .onSuccess { articles ->
                    _uiState.value = _uiState.value.copy(
                        articles = articles,
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
    
    fun createArticle(slug: String, title: String, content: String, published: Boolean) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val article = ArticleCreate(
                slug = slug,
                title = title,
                content = content,
                published = published
            )
            
            articleRepository.createArticle(article)
                .onSuccess { loadArticles() }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message
                    )
                }
        }
    }
    
    fun deleteArticle(slug: String) {
        viewModelScope.launch {
            articleRepository.deleteArticle(slug)
                .onSuccess { loadArticles() }
                .onFailure { exception ->
                    _uiState.value = _uiState.value.copy(error = exception.message)
                }
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
