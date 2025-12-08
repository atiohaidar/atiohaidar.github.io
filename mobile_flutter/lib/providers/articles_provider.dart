import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Articles provider
class ArticlesProvider extends ChangeNotifier {
  List<Article> _articles = [];
  Article? _selectedArticle;
  bool _isLoading = false;
  String? _error;

  List<Article> get articles => _articles;
  List<Article> get publishedArticles => _articles.where((a) => a.published).toList();
  List<Article> get draftArticles => _articles.where((a) => !a.published).toList();
  Article? get selectedArticle => _selectedArticle;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Load all articles
  Future<void> loadArticles() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _articles = await ApiService.getArticles();
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load article by slug
  Future<void> loadArticle(String slug) async {
    _isLoading = true;
    notifyListeners();

    try {
      _selectedArticle = await ApiService.getArticle(slug);
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Create a new article
  Future<bool> createArticle(ArticleCreate data) async {
    try {
      final article = await ApiService.createArticle(data);
      _articles.insert(0, article);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Update an article
  Future<bool> updateArticle(String slug, ArticleUpdate data) async {
    try {
      final updatedArticle = await ApiService.updateArticle(slug, data);
      final index = _articles.indexWhere((a) => a.slug == slug);
      if (index != -1) {
        _articles[index] = updatedArticle;
        notifyListeners();
      }
      if (_selectedArticle?.slug == slug) {
        _selectedArticle = updatedArticle;
        notifyListeners();
      }
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Delete an article
  Future<bool> deleteArticle(String slug) async {
    try {
      await ApiService.deleteArticle(slug);
      _articles.removeWhere((a) => a.slug == slug);
      if (_selectedArticle?.slug == slug) {
        _selectedArticle = null;
      }
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
