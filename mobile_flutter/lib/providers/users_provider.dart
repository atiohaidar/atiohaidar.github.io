import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Users provider (admin only)
class UsersProvider extends ChangeNotifier {
  List<User> _users = [];
  bool _isLoading = false;
  String? _error;

  List<User> get users => _users;
  List<User> get adminUsers => _users.where((u) => u.isAdmin).toList();
  List<User> get memberUsers => _users.where((u) => !u.isAdmin).toList();
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Load all users
  Future<void> loadUsers() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _users = await ApiService.getUsers();
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Create a new user
  Future<bool> createUser(UserCreate data) async {
    try {
      final user = await ApiService.createUser(data);
      _users.add(user);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Update a user
  Future<bool> updateUser(String username, UserUpdate data) async {
    try {
      final updatedUser = await ApiService.updateUser(username, data);
      final index = _users.indexWhere((u) => u.username == username);
      if (index != -1) {
        _users[index] = updatedUser;
        notifyListeners();
      }
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Delete a user
  Future<bool> deleteUser(String username) async {
    try {
      await ApiService.deleteUser(username);
      _users.removeWhere((u) => u.username == username);
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
