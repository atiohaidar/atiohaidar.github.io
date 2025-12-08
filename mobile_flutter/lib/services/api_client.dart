import 'package:dio/dio.dart';
import '../config/api_config.dart';
import 'storage_service.dart';

/// API Client service using Dio
class ApiClient {
  static Dio? _dio;
  static final StorageService _storage = StorageService();

  static Dio get instance {
    _dio ??= _createDio();
    return _dio!;
  }

  static Dio _createDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.apiUrl,
        connectTimeout: ApiConfig.connectTimeout,
        receiveTimeout: ApiConfig.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Add interceptors
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add auth token if available
          final token = await _storage.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onResponse: (response, handler) {
          return handler.next(response);
        },
        onError: (DioException error, handler) {
          // Handle common errors
          if (error.response?.statusCode == 401) {
            // Token expired or invalid - clear storage
            _storage.clearAll();
          }
          return handler.next(error);
        },
      ),
    );

    // Add logging in debug mode
    dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      logPrint: (o) => print('API: $o'),
    ));

    return dio;
  }

  /// Reset the Dio instance (useful after logout)
  static void reset() {
    _dio = null;
  }

  // Generic API methods
  static Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return instance.get<T>(path, queryParameters: queryParameters, options: options);
  }

  static Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return instance.post<T>(path, data: data, queryParameters: queryParameters, options: options);
  }

  static Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return instance.put<T>(path, data: data, queryParameters: queryParameters, options: options);
  }

  static Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return instance.delete<T>(path, data: data, queryParameters: queryParameters, options: options);
  }
}

/// API Exception for error handling
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic data;

  ApiException({
    required this.message,
    this.statusCode,
    this.data,
  });

  factory ApiException.fromDioError(DioException error) {
    String message;
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        message = 'Connection timeout. Please check your internet connection.';
        break;
      case DioExceptionType.sendTimeout:
        message = 'Send timeout. Please try again.';
        break;
      case DioExceptionType.receiveTimeout:
        message = 'Receive timeout. Please try again.';
        break;
      case DioExceptionType.badResponse:
        message = error.response?.data?['message'] ?? 'Server error occurred';
        break;
      case DioExceptionType.cancel:
        message = 'Request was cancelled';
        break;
      case DioExceptionType.connectionError:
        message = 'No internet connection';
        break;
      default:
        message = 'Something went wrong. Please try again.';
    }

    return ApiException(
      message: message,
      statusCode: error.response?.statusCode,
      data: error.response?.data,
    );
  }

  @override
  String toString() => message;
}
