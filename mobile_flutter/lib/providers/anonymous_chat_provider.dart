import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Provider for anonymous chat functionality
class AnonymousChatProvider with ChangeNotifier {
  List<AnonymousMessage> _messages = [];
  bool _isLoading = false;
  String? _error;
  String? _senderId;

  List<AnonymousMessage> get messages => _messages;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get senderId => _senderId;

  /// Initialize sender ID (unique per session/device)
  void initSenderId(String userId) {
    // Use a hash of the userId for anonymity
    _senderId = 'anon_${userId.hashCode.abs().toString().substring(0, 8)}';
    notifyListeners();
  }

  /// Load anonymous messages
  Future<void> loadMessages() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _messages = await ApiService.getAnonymousMessages();
      // Sort by created_at ascending (oldest first)
      _messages.sort((a, b) => a.createdAt.compareTo(b.createdAt));
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Send anonymous message
  Future<bool> sendMessage(String content, {String? replyToId}) async {
    if (_senderId == null) return false;

    try {
      final message = await ApiService.sendAnonymousMessage(
        AnonymousMessageCreate(
          senderId: _senderId!,
          content: content,
          replyToId: replyToId,
        ),
      );
      _messages.add(message);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// Delete all messages (admin only)
  Future<bool> deleteAllMessages() async {
    try {
      await ApiService.deleteAnonymousMessages();
      _messages.clear();
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// Check if message is from current sender
  bool isOwnMessage(AnonymousMessage message) {
    return message.senderId == _senderId;
  }

  /// Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
