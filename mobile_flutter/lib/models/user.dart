import 'package:equatable/equatable.dart';

/// User role enum
enum UserRole { admin, member }

/// User model
class User extends Equatable {
  final String username;
  final String name;
  final UserRole role;

  const User({
    required this.username,
    required this.name,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      username: json['username'] as String,
      name: json['name'] as String,
      role: json['role'] == 'admin' ? UserRole.admin : UserRole.member,
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
  List<Object?> get props => [username, name, role];
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
