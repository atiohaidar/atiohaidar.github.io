import 'package:flutter/material.dart';
import '../../services/services.dart';
import '../../models/models.dart';

class ChatProvider extends ChangeNotifier {
  final WebSocketService _wsService = WebSocketService();
  bool _isLoading = false;
  String? _error;
  
  List<ChatConversation> _conversations = [];
  List<ChatMessage> _messages = [];
  String? _currentConversationId;

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<ChatConversation> get conversations => _conversations;
  List<ChatMessage> get messages => _messages;

  ChatProvider() {
    // Listen for incoming WebSocket messages
    _wsService.addListener(_handleWebSocketMessage);
  }

  @override
  void dispose() {
    _wsService.removeListener(_handleWebSocketMessage);
    super.dispose();
  }

  void _handleWebSocketMessage(dynamic message) {
    // Check if message is a chat message
    if (message is Map<String, dynamic> && message['type'] == 'chat_message') {
      final chatMsg = ChatMessage.fromJson(message['data']);
      
      // If belongs to current conversation, add it
      if (chatMsg.conversationId == _currentConversationId) {
        _messages.add(chatMsg);
        notifyListeners();
      }

      // Update last message in conversation list
      final index = _conversations.indexWhere((c) => c.id == chatMsg.conversationId);
      if (index != -1) {
        // Create new conversation object with updated last message
        // Since ChatConversation fields are final, we can't just set them. 
        // We'll rely on reloading or partial updates if we add copyWith to model.
        // For simplicity now, let's just trigger a reload of conversations or ignoring list update for now.
        // Ideally we should reload list or have mutable fields (but immutable is better).
        loadConversations(silent: true);
      }
    }
  }

  Future<void> loadConversations({bool silent = false}) async {
    if (!silent) {
      _isLoading = true;
      _error = null;
      notifyListeners();
    }

    try {
      _conversations = await ApiService.getConversations();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMessages(String conversationId) async {
    _isLoading = true;
    _error = null;
    _currentConversationId = conversationId;
    _messages = []; // Clear previous messages
    notifyListeners();

    try {
      _messages = await ApiService.getMessages(conversationId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> sendMessage(String content, {String? replyToId}) async {
    if (_currentConversationId == null || content.trim().isEmpty) return;

    final tempId = DateTime.now().toIso8601String(); // Temp ID for optimistic UI
    // Optimistic update could happen here, but for now we wait for API
    
    try {
       final msg = await ApiService.sendMessage(MessageCreate(
        conversationId: _currentConversationId,
        content: content,
        replyToId: replyToId,
      ));
      
      _messages.add(msg);
      notifyListeners();
      
      // Also send via WebSocket if needed, but normally REST response is enough
      // Depending on backend implementation.
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> createConversation(String username) async {
    try {
      final conversation = await ApiService.createConversation(username);
      _conversations.insert(0, conversation);
      _currentConversationId = conversation.id;
      _messages = [];
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  void leaveConversation() {
    _currentConversationId = null;
    _messages = [];
    notifyListeners();
  }
}
