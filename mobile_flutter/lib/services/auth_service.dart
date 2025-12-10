import 'package:dio/dio.dart';
import '../models/models.dart';
import 'api_client.dart';
import 'storage_service.dart';

/// Authentication service
class AuthService {
  final StorageService _storage = StorageService();

  /// Login with username and password
  Future<LoginResponse> login(String username, String password) async {
    try {
      final response = await ApiClient.post(
        '/auth/login',
        data: LoginRequest(username: username, password: password).toJson(),
      );

      final loginResponse = LoginResponse.fromJson(response.data);

      // Save token and user
      await _storage.saveToken(loginResponse.token);
      await _storage.saveUser(loginResponse.user);

      return loginResponse;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Register a new user account
  Future<RegisterResponse> register(
      String username, String name, String password) async {
    try {
      final response = await ApiClient.post(
        '/auth/register',
        data:
            RegisterRequest(username: username, name: name, password: password)
                .toJson(),
      );

      return RegisterResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Reset password for a user (simple reset - no email verification)
  Future<ForgotPasswordResponse> forgotPassword(
      String username, String newPassword) async {
    try {
      final response = await ApiClient.post(
        '/auth/forgot-password',
        data:
            ForgotPasswordRequest(username: username, newPassword: newPassword)
                .toJson(),
      );

      return ForgotPasswordResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Logout and clear stored data
  Future<void> logout() async {
    await _storage.clearAll();
    ApiClient.reset(); // Reset Dio instance to clear auth headers
  }

  /// Check if user is logged in
  Future<bool> isLoggedIn() async {
    return await _storage.hasToken();
  }

  /// Get stored user
  Future<User?> getStoredUser() async {
    return await _storage.getUser();
  }

  /// Get stored token
  Future<String?> getToken() async {
    return await _storage.getToken();
  }

  /// Update stored user data (for profile updates)
  Future<void> updateStoredUser(User user) async {
    await _storage.saveUser(user);
  }
}
