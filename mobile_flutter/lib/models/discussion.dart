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
    return Discussion(
      id: json['id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      creatorUsername: json['creator_username'] as String?,
      creatorName: json['creator_name'] as String,
      isAnonymous: json['is_anonymous'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      replyCount: json['reply_count'] as int?,
    );
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
    return DiscussionReply(
      id: json['id'] as String,
      discussionId: json['discussion_id'] as String,
      content: json['content'] as String,
      creatorUsername: json['creator_username'] as String?,
      creatorName: json['creator_name'] as String,
      isAnonymous: json['is_anonymous'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
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
