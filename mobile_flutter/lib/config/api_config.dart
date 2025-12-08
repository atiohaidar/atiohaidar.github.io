/// API Configuration for the Flutter app
class ApiConfig {
  // Base URL for the backend API
  // Change this to your production URL when deploying
  static const String baseUrl = 'https://atiohaidar-backend.haidarprograming.workers.dev';
  
  // Alternative development URL (uncomment if needed)
  // static const String baseUrl = 'http://localhost:8787';
  
  // API version prefix
  static const String apiPrefix = '/api';
  
  // Full API URL
  static String get apiUrl => '$baseUrl$apiPrefix';
  
  // WebSocket URL for real-time chat
  static String get wsUrl => baseUrl.replaceFirst('https://', 'wss://').replaceFirst('http://', 'ws://');
  
  // Timeout settings
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
