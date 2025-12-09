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
      final index =
          _conversations.indexWhere((c) => c.id == chatMsg.conversationId);
      if (index != -1) {
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
      if (!silent) {
        _isLoading = false;
        notifyListeners();
      }
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

    try {
      final msg = await ApiService.sendMessage(MessageCreate(
        conversationId: _currentConversationId,
        content: content,
        replyToId: replyToId,
      ));

      _messages.add(msg);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> getOrCreateConversation(String username) async {
    try {
      final conversation = await ApiService.getOrCreateConversation(username);
      // Check if conversation already exists in list
      final existingIndex =
          _conversations.indexWhere((c) => c.id == conversation.id);
      if (existingIndex == -1) {
        _conversations.insert(0, conversation);
      }
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

  // Group chat functionality
  List<ChatGroup> _groups = [];
  List<ChatGroup> get groups => _groups;
  String? _currentGroupId;

  Future<void> loadGroups({bool silent = false}) async {
    if (!silent) {
      _isLoading = true;
      _error = null;
      notifyListeners();
    }

    try {
      _groups = await ApiService.getGroups();
    } catch (e) {
      _error = e.toString();
    } finally {
      if (!silent) {
        _isLoading = false;
        notifyListeners();
      }
    }
  }

  Future<void> loadGroupMessages(String groupId) async {
    _isLoading = true;
    _error = null;
    _currentGroupId = groupId;
    _messages = [];
    notifyListeners();

    try {
      _messages = await ApiService.getGroupMessages(groupId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> sendGroupMessage(String content, {String? replyToId}) async {
    if (_currentGroupId == null || content.trim().isEmpty) return;

    try {
      final msg = await ApiService.sendMessage(MessageCreate(
        groupId: _currentGroupId,
        content: content,
        replyToId: replyToId,
      ));

      _messages.add(msg);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> createGroup(GroupCreate data) async {
    try {
      final group = await ApiService.createGroup(data);
      _groups.insert(0, group);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> updateGroup(String groupId, GroupUpdate data) async {
    try {
      final updatedGroup = await ApiService.updateGroup(groupId, data);
      final index = _groups.indexWhere((g) => g.id == groupId);
      if (index != -1) {
        _groups[index] = updatedGroup;
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> deleteGroup(String groupId) async {
    try {
      await ApiService.deleteGroup(groupId);
      _groups.removeWhere((g) => g.id == groupId);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  void leaveGroup() {
    _currentGroupId = null;
    _messages = [];
    notifyListeners();
  }
}
