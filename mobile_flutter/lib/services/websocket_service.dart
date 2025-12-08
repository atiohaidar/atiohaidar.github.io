import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../config/api_config.dart';
import 'storage_service.dart';

/// WebSocket service for real-time communication
class WebSocketService {
  WebSocketChannel? _channel;
  final StorageService _storage = StorageService();
  final List<void Function(dynamic)> _listeners = [];
  bool _isConnected = false;

  bool get isConnected => _isConnected;

  /// Connect to WebSocket
  Future<void> connect() async {
    if (_isConnected) return;

    final token = await _storage.getToken();
    if (token == null) return;

    try {
      final wsUrl = '${ApiConfig.wsUrl}?token=$token';
      _channel = WebSocketChannel.connect(Uri.parse(wsUrl));
      _isConnected = true;

      _channel!.stream.listen(
        (message) {
          _handleMessage(message);
        },
        onDone: () {
          _isConnected = false;
          _reconnect();
        },
        onError: (error) {
          _isConnected = false;
          _reconnect();
        },
      );
    } catch (e) {
      _isConnected = false;
      _reconnect();
    }
  }

  /// Disconnect from WebSocket
  void disconnect() {
    _channel?.sink.close();
    _isConnected = false;
    _channel = null;
  }

  /// Send message
  void search(dynamic data) {
    if (_isConnected && _channel != null) {
      _channel!.sink.add(jsonEncode(data));
    }
  }

  /// Add message listener
  void addListener(void Function(dynamic) listener) {
    _listeners.add(listener);
  }

  /// Remove message listener
  void removeListener(void Function(dynamic) listener) {
    _listeners.remove(listener);
  }

  void _handleMessage(dynamic message) {
    try {
      final decoded = jsonDecode(message);
      for (final listener in _listeners) {
        listener(decoded);
      }
    } catch (e) {
      // Handle non-JSON messages or parsing errors
    }
  }

  void _reconnect() {
    Future.delayed(const Duration(seconds: 5), () {
      if (!_isConnected) {
        connect();
      }
    });
  }
}
