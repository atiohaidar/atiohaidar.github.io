import 'package:equatable/equatable.dart';

/// Chat message model
class ChatMessage extends Equatable {
  final String id;
  final String? conversationId;
  final String? groupId;
  final String senderUsername;
  final String? senderName; // Optional, from join
  final String content;
  final String? replyToId;
  final String? replyContent; // Optional, from join
  final String? replySenderName; // Optional, from join
  final String createdAt;

  const ChatMessage({
    required this.id,
    this.conversationId,
    this.groupId,
    required this.senderUsername,
    this.senderName,
    required this.content,
    this.replyToId,
    this.replyContent,
    this.replySenderName,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String,
      conversationId: json['conversation_id'] as String?,
      groupId: json['group_id'] as String?,
      senderUsername: json['sender_username'] as String,
      senderName: json['sender_name'] as String?,
      content: json['content'] as String,
      replyToId: json['reply_to_id'] as String?,
      replyContent: json['reply_content'] as String?,
      replySenderName: json['reply_sender_name'] as String?,
      createdAt: json['created_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      if (conversationId != null) 'conversation_id': conversationId,
      if (groupId != null) 'group_id': groupId,
      'sender_username': senderUsername,
      'content': content,
      if (replyToId != null) 'reply_to_id': replyToId,
      'created_at': createdAt,
    };
  }

  @override
  List<Object?> get props => [id, conversationId, groupId, senderUsername, content, replyToId, createdAt];
}

/// Chat conversation model
class ChatConversation extends Equatable {
  final String id;
  final String user1Username;
  final String user2Username;
  final String? otherUsername; // Computed on client or server
  final String? otherName; // Computed
  final String? lastMessage;
  final String? lastMessageTime;
  final String createdAt;
  final String updatedAt;

  const ChatConversation({
    required this.id,
    required this.user1Username,
    required this.user2Username,
    this.otherUsername,
    this.otherName,
    this.lastMessage,
    this.lastMessageTime,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ChatConversation.fromJson(Map<String, dynamic> json) {
    return ChatConversation(
      id: json['id'] as String,
      user1Username: json['user1_username'] as String,
      user2Username: json['user2_username'] as String,
      otherUsername: json['other_username'] as String?,
      otherName: json['other_name'] as String?,
      lastMessage: json['last_message'] as String?,
      lastMessageTime: json['last_message_time'] as String?,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user1_username': user1Username,
      'user2_username': user2Username,
      if (otherUsername != null) 'other_username': otherUsername,
      if (otherName != null) 'other_name': otherName,
      if (lastMessage != null) 'last_message': lastMessage,
      if (lastMessageTime != null) 'last_message_time': lastMessageTime,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  @override
  List<Object?> get props => [id, user1Username, user2Username, otherUsername, lastMessage, updatedAt];
}

/// Message create request
class MessageCreate {
  final String? conversationId;
  final String? groupId;
  final String content;
  final String? replyToId;

  const MessageCreate({
    this.conversationId,
    this.groupId,
    required this.content,
    this.replyToId,
  });

  Map<String, dynamic> toJson() {
    return {
      if (conversationId != null) 'conversation_id': conversationId,
      if (groupId != null) 'group_id': groupId,
      'content': content,
      if (replyToId != null) 'reply_to_id': replyToId,
    };
  }
}

/// Group chat model
class ChatGroup extends Equatable {
  final String id;
  final String name;
  final String? description;
  final String createdBy;
  final String createdAt;
  final String updatedAt;
  final int? memberCount;

  const ChatGroup({
    required this.id,
    required this.name,
    this.description,
    required this.createdBy,
    required this.createdAt,
    required this.updatedAt,
    this.memberCount,
  });

  factory ChatGroup.fromJson(Map<String, dynamic> json) {
    return ChatGroup(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      createdBy: json['created_by'] as String,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
      memberCount: json['member_count'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      if (description != null) 'description': description,
      'created_by': createdBy,
      'created_at': createdAt,
      'updated_at': updatedAt,
      if (memberCount != null) 'member_count': memberCount,
    };
  }

  @override
  List<Object?> get props => [id, name, description, createdBy, createdAt, updatedAt, memberCount];
}

/// Group member model
class GroupMember extends Equatable {
  final String id;
  final String groupId;
  final String userUsername;
  final String role; // 'admin' or 'member'
  final String joinedAt;

  const GroupMember({
    required this.id,
    required this.groupId,
    required this.userUsername,
    required this.role,
    required this.joinedAt,
  });

  factory GroupMember.fromJson(Map<String, dynamic> json) {
    return GroupMember(
      id: json['id'] as String,
      groupId: json['group_id'] as String,
      userUsername: json['user_username'] as String,
      role: json['role'] as String,
      joinedAt: json['joined_at'] as String,
    );
  }

  @override
  List<Object?> get props => [id, groupId, userUsername, role, joinedAt];
}

/// Group create request
class GroupCreate {
  final String name;
  final String? description;

  const GroupCreate({
    required this.name,
    this.description,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      if (description != null) 'description': description,
    };
  }
}

/// Group update request
class GroupUpdate {
  final String? name;
  final String? description;

  const GroupUpdate({
    this.name,
    this.description,
  });

  Map<String, dynamic> toJson() {
    return {
      if (name != null) 'name': name,
      if (description != null) 'description': description,
    };
  }
}
