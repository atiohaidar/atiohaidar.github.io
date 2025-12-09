import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Authentication state enum
enum AuthState { initial, loading, authenticated, unauthenticated, error }

/// Authentication provider
class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  AuthState _state = AuthState.initial;
  User? _user;
  String? _error;

  AuthState get state => _state;
  User? get user => _user;
  String? get error => _error;
  bool get isAuthenticated => _state == AuthState.authenticated;
  bool get isLoading => _state == AuthState.loading;
  bool get isAdmin => _user?.isAdmin ?? false;

  /// Initialize auth state by checking stored credentials
  Future<void> initialize() async {
    _state = AuthState.loading;
    notifyListeners();

    try {
      final isLoggedIn = await _authService.isLoggedIn();
      if (isLoggedIn) {
        _user = await _authService.getStoredUser();
        _state = AuthState.authenticated;
      } else {
        _state = AuthState.unauthenticated;
      }
    } catch (e) {
      _state = AuthState.unauthenticated;
      _error = e.toString();
    }
    notifyListeners();
  }

  /// Login with username and password
  Future<bool> login(String username, String password) async {
    _state = AuthState.loading;
    _error = null;
    notifyListeners();

    try {
      final response = await _authService.login(username, password);
      _user = response.user;
      _state = AuthState.authenticated;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      _state = AuthState.error;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Login failed. Please try again.';
      _state = AuthState.error;
      notifyListeners();
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    _state = AuthState.loading;
    notifyListeners();

    await _authService.logout();
    _user = null;
    _state = AuthState.unauthenticated;
    notifyListeners();
  }

  /// Clear error
  void clearError() {
    _error = null;
    if (_state == AuthState.error) {
      _state = AuthState.unauthenticated;
    }
    notifyListeners();
  }

  /// Update current user's profile
  Future<bool> updateProfile(UserUpdate data) async {
    try {
      final updatedUser = await ApiService.updateProfile(data);
      _user = updatedUser;
      // Update stored user via auth service
      await _authService.updateStoredUser(updatedUser);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Failed to update profile';
      notifyListeners();
      return false;
    }
  }

  /// Check authentication status and refresh user data
  Future<void> checkAuth() async {
    try {
      if (_user != null) {
        final refreshedUser = await ApiService.getUser(_user!.username);
        _user = refreshedUser;
        notifyListeners();
      }
    } catch (e) {
      if (kDebugMode) {
        print('Check auth failed: $e');
      }
    }
  }
}
