import 'package:equatable/equatable.dart';

/// Discussion model
class Discussion extends Equatable {
  final String id;
  final String title;
  final String content;
  final String? creatorUsername;
  final String creatorName;
  final bool isAnonymous;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int? replyCount;

  const Discussion({
    required this.id,
    required this.title,
    required this.content,
    this.creatorUsername,
    required this.creatorName,
    required this.isAnonymous,
    required this.createdAt,
    required this.updatedAt,
    this.replyCount,
  });

  factory Discussion.fromJson(Map<String, dynamic> json) {
    try {
      return Discussion(
        id: json['id']?.toString() ?? '',
        title: json['title']?.toString() ?? '',
        content: json['content']?.toString() ?? '',
        creatorUsername: json['creator_username']?.toString(),
        creatorName: json['creator_name']?.toString() ?? 'Anonymous',
        isAnonymous: _parseBool(json['is_anonymous']),
        createdAt: _parseDateTime(json['created_at']),
        updatedAt: _parseDateTime(json['updated_at']),
        replyCount: json['reply_count'] as int?,
      );
    } catch (e) {
      // ignore: avoid_print
      print('DEBUG: Error parsing Discussion: $e');
      // ignore: avoid_print
      print('DEBUG: Discussion JSON: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'creator_username': creatorUsername,
      'creator_name': creatorName,
      'is_anonymous': isAnonymous,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      if (replyCount != null) 'reply_count': replyCount,
    };
  }

  @override
  List<Object?> get props => [
        id,
        title,
        content,
        creatorUsername,
        creatorName,
        isAnonymous,
        createdAt,
        updatedAt,
        replyCount,
      ];
}

/// Discussion reply model
class DiscussionReply extends Equatable {
  final String id;
  final String discussionId;
  final String content;
  final String? creatorUsername;
  final String creatorName;
  final bool isAnonymous;
  final DateTime createdAt;
  final DateTime updatedAt;

  const DiscussionReply({
    required this.id,
    required this.discussionId,
    required this.content,
    this.creatorUsername,
    required this.creatorName,
    required this.isAnonymous,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DiscussionReply.fromJson(Map<String, dynamic> json) {
    try {
      return DiscussionReply(
        id: json['id']?.toString() ?? '',
        discussionId: json['discussion_id']?.toString() ?? '',
        content: json['content']?.toString() ?? '',
        creatorUsername: json['creator_username']?.toString(),
        creatorName: json['creator_name']?.toString() ?? 'Anonymous',
        isAnonymous: _parseBool(json['is_anonymous']),
        createdAt: _parseDateTime(json['created_at']),
        updatedAt: _parseDateTime(json['updated_at']),
      );
    } catch (e) {
      // ignore: avoid_print
      print('DEBUG: Error parsing DiscussionReply: $e');
      // ignore: avoid_print
      print('DEBUG: Reply JSON: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'discussion_id': discussionId,
      'content': content,
      'creator_username': creatorUsername,
      'creator_name': creatorName,
      'is_anonymous': isAnonymous,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [
        id,
        discussionId,
        content,
        creatorUsername,
        creatorName,
        isAnonymous,
        createdAt,
        updatedAt,
      ];
}

/// Create discussion request
class DiscussionCreate {
  final String title;
  final String content;
  final String? creatorName;

  const DiscussionCreate({
    required this.title,
    required this.content,
    this.creatorName,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'content': content,
      if (creatorName != null) 'creator_name': creatorName,
    };
  }
}

/// Create discussion reply request
class DiscussionReplyCreate {
  final String content;
  final String? creatorName;

  const DiscussionReplyCreate({
    required this.content,
    this.creatorName,
  });

  Map<String, dynamic> toJson() {
    return {
      'content': content,
      if (creatorName != null) 'creator_name': creatorName,
    };
  }
}

/// Discussion with replies
class DiscussionWithReplies {
  final Discussion discussion;
  final List<DiscussionReply> replies;

  const DiscussionWithReplies({
    required this.discussion,
    required this.replies,
  });

  factory DiscussionWithReplies.fromJson(Map<String, dynamic> json) {
    return DiscussionWithReplies(
      discussion: Discussion.fromJson(json),
      replies: (json['replies'] as List?)
              ?.map((r) => DiscussionReply.fromJson(r as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

/// Helper to parse bool from int (0/1) or bool
bool _parseBool(dynamic value, {bool defaultValue = false}) {
  if (value == null) return defaultValue;
  if (value is bool) return value;
  if (value is int) return value != 0;
  if (value is String) return value.toLowerCase() == 'true' || value == '1';
  return defaultValue;
}

/// Helper to parse DateTime safely
DateTime _parseDateTime(dynamic value) {
  if (value == null) return DateTime.now();
  if (value is DateTime) return value;
  if (value is String) {
    try {
      return DateTime.parse(value);
    } catch (_) {
      // Try replacing space with T if it's SQL style 'YYYY-MM-DD HH:MM:SS'
      try {
        return DateTime.parse(value.replaceAll(' ', 'T'));
      } catch (_) {
        return DateTime.now(); // Fallback
      }
    }
  }
  return DateTime.now();
}
