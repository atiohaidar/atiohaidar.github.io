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
      id: json['id'].toString(),
      conversationId: json['conversation_id']?.toString(),
      groupId: json['group_id']?.toString(),
      senderUsername: json['sender_username'] as String,
      senderName: json['sender_name'] as String?,
      content: json['content'] as String,
      replyToId: json['reply_to_id']?.toString(),
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
  List<Object?> get props => [
        id,
        conversationId,
        groupId,
        senderUsername,
        content,
        replyToId,
        createdAt
      ];
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
    print('ChatConversation.fromJson: $json');
    return ChatConversation(
      id: json['id'].toString(),
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
  List<Object?> get props =>
      [id, user1Username, user2Username, otherUsername, lastMessage, updatedAt];
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
