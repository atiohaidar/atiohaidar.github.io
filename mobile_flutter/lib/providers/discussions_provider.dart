import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Discussions provider
class DiscussionsProvider extends ChangeNotifier {
  List<Discussion> _discussions = [];
  DiscussionWithReplies? _selectedDiscussion;
  bool _isLoading = false;
  String? _error;

  List<Discussion> get discussions => _discussions;
  DiscussionWithReplies? get selectedDiscussion => _selectedDiscussion;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Load all discussions
  Future<void> loadDiscussions() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _discussions = await ApiService.getDiscussions();
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Parse error: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load discussion by id with replies
  Future<void> loadDiscussion(String id) async {
    _isLoading = true;
    notifyListeners();

    try {
      _selectedDiscussion = await ApiService.getDiscussion(id);
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Parse error: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Create a new discussion
  Future<bool> createDiscussion(DiscussionCreate data) async {
    try {
      final discussion = await ApiService.createDiscussion(data);
      _discussions.insert(0, discussion);
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Add a reply to a discussion
  Future<bool> addReply(String discussionId, DiscussionReplyCreate data) async {
    try {
      final reply = await ApiService.addDiscussionReply(discussionId, data);
      if (_selectedDiscussion != null &&
          _selectedDiscussion!.discussion.id == discussionId) {
        _selectedDiscussion = DiscussionWithReplies(
          discussion: _selectedDiscussion!.discussion,
          replies: [..._selectedDiscussion!.replies, reply],
        );
        notifyListeners();
      }
      // Update reply count in list
      final index = _discussions.indexWhere((d) => d.id == discussionId);
      if (index != -1) {
        final updated = Discussion(
          id: _discussions[index].id,
          title: _discussions[index].title,
          content: _discussions[index].content,
          creatorUsername: _discussions[index].creatorUsername,
          creatorName: _discussions[index].creatorName,
          isAnonymous: _discussions[index].isAnonymous,
          createdAt: _discussions[index].createdAt,
          updatedAt: _discussions[index].updatedAt,
          replyCount: (_discussions[index].replyCount ?? 0) + 1,
        );
        _discussions[index] = updated;
        notifyListeners();
      }
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  /// Delete a discussion
  Future<bool> deleteDiscussion(String id) async {
    try {
      await ApiService.deleteDiscussion(id);
      _discussions.removeWhere((d) => d.id == id);
      if (_selectedDiscussion?.discussion.id == id) {
        _selectedDiscussion = null;
      }
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
