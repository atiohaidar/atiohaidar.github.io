import 'package:equatable/equatable.dart';

/// User role enum
enum UserRole { admin, member }

/// User model
class User extends Equatable {
  final String username;
  final String name;
  final UserRole role;
  final double balance;

  const User({
    required this.username,
    required this.name,
    required this.role,
    this.balance = 0.0,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      username: json['username'] as String,
      name: json['name'] as String,
      role: json['role'] == 'admin' ? UserRole.admin : UserRole.member,
      balance: (json['balance'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'username': username,
      'name': name,
      'role': role == UserRole.admin ? 'admin' : 'member',
    };
  }

  bool get isAdmin => role == UserRole.admin;

  @override
  List<Object?> get props => [username, name, role, balance];
}

/// Login request
class LoginRequest {
  final String username;
  final String password;

  const LoginRequest({
    required this.username,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    return {
      'username': username,
      'password': password,
    };
  }
}

/// Login response
class LoginResponse {
  final bool success;
  final String token;
  final User user;

  const LoginResponse({
    required this.success,
    required this.token,
    required this.user,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      success: json['success'] as bool,
      token: json['token'] as String,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}

/// User create request
class UserCreate {
  final String username;
  final String name;
  final String password;
  final UserRole? role;

  const UserCreate({
    required this.username,
    required this.name,
    required this.password,
    this.role,
  });

  Map<String, dynamic> toJson() {
    return {
      'username': username,
      'name': name,
      'password': password,
      if (role != null) 'role': role == UserRole.admin ? 'admin' : 'member',
    };
  }
}

/// User update request
class UserUpdate {
  final String? name;
  final String? password;
  final UserRole? role;

  const UserUpdate({
    this.name,
    this.password,
    this.role,
  });

  Map<String, dynamic> toJson() {
    return {
      if (name != null) 'name': name,
      if (password != null) 'password': password,
      if (role != null) 'role': role == UserRole.admin ? 'admin' : 'member',
    };
  }
}

/// Register request
class RegisterRequest {
  final String username;
  final String name;
  final String password;

  const RegisterRequest({
    required this.username,
    required this.name,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    return {
      'username': username,
      'name': name,
      'password': password,
    };
  }
}

/// Register response
class RegisterResponse {
  final bool success;
  final String message;
  final User? user;

  const RegisterResponse({
    required this.success,
    required this.message,
    this.user,
  });

  factory RegisterResponse.fromJson(Map<String, dynamic> json) {
    return RegisterResponse(
      success: json['success'] as bool,
      message: json['message'] as String,
      user: json['user'] != null
          ? User.fromJson(json['user'] as Map<String, dynamic>)
          : null,
    );
  }
}

/// Forgot password request
class ForgotPasswordRequest {
  final String username;
  final String newPassword;

  const ForgotPasswordRequest({
    required this.username,
    required this.newPassword,
  });

  Map<String, dynamic> toJson() {
    return {
      'username': username,
      'newPassword': newPassword,
    };
  }
}

/// Forgot password response
class ForgotPasswordResponse {
  final bool success;
  final String message;

  const ForgotPasswordResponse({
    required this.success,
    required this.message,
  });

  factory ForgotPasswordResponse.fromJson(Map<String, dynamic> json) {
    return ForgotPasswordResponse(
      success: json['success'] as bool,
      message: json['message'] as String,
    );
  }
}
