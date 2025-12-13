import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

/// Individual Chat Screen
class ChatScreen extends StatefulWidget {
  final String conversationId; // Can be conversation ID or Group ID
  final ChatConversation? conversation; // Passed for initial header info
  final ChatGroup? group; // Passed for initial header info if group
  final bool isGroup;

  const ChatScreen({
    super.key,
    required this.conversationId,
    this.conversation,
    this.group,
    this.isGroup = false,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  ChatMessage? _replyToMessage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.isGroup) {
        context.read<ChatProvider>().loadGroupMessages(widget.conversationId);
      } else {
        context.read<ChatProvider>().loadMessages(widget.conversationId);
      }
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _setReplyTo(ChatMessage message) {
    setState(() => _replyToMessage = message);
  }

  void _clearReply() {
    setState(() => _replyToMessage = null);
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    final replyId = _replyToMessage?.id;

    if (widget.isGroup) {
      context.read<ChatProvider>().sendGroupMessage(text, replyToId: replyId);
    } else {
      context.read<ChatProvider>().sendMessage(text, replyToId: replyId);
    }
    _messageController.clear();
    _clearReply();

    // Scroll to bottom after sending
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final chatProvider = context.watch<ChatProvider>();
    final authProvider = context.read<AuthProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Determine title
    String title = 'Chat';
    if (widget.isGroup && widget.group != null) {
      title = widget.group!.name;
    } else if (widget.conversation != null) {
      final isUser1 =
          widget.conversation!.user1Username == authProvider.user?.username;
      title = widget.conversation!.otherName ??
          (isUser1
              ? widget.conversation!.user2Username
              : widget.conversation!.user1Username);
    }

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: Text(title),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        actions: widget.isGroup
            ? [
                IconButton(
                  icon: const Icon(Icons.group),
                  onPressed: () => context.push(
                    '/groups/${widget.conversationId}/members',
                    extra: widget.group,
                  ),
                ),
              ]
            : null,
      ),
      body: Column(
        children: [
          Expanded(
            child: _buildMessagesList(chatProvider, authProvider, isDark),
          ),
          if (_replyToMessage != null) _buildReplyPreview(isDark),
          _buildMessageInput(isDark),
        ],
      ),
    );
  }

  Widget _buildMessagesList(
      ChatProvider provider, AuthProvider authProvider, bool isDark) {
    if (provider.isLoading && provider.messages.isEmpty) {
      return const LoadingIndicator(message: 'Memuat pesan...');
    }

    if (provider.messages.isEmpty) {
      return Center(
        child: Text(
          'Belum ada pesan',
          style: TextStyle(
            color: isDark ? AppColors.textMuted : Colors.grey.shade600,
          ),
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16),
      itemCount: provider.messages.length,
      itemBuilder: (context, index) {
        final message = provider.messages[index];
        final isMe = message.senderUsername == authProvider.user?.username;
        final showDate = index == 0 ||
            _shouldShowDate(
                message.createdAt, provider.messages[index - 1].createdAt);

        return Column(
          children: [
            if (showDate) _buildDateHeader(message.createdAt, isDark),
            _buildMessageBubble(message, isMe, isDark, provider.messages),
          ],
        );
      },
    );
  }

  bool _shouldShowDate(String currentStr, String prevStr) {
    final current = DateTime.parse(currentStr).toLocal();
    final prev = DateTime.parse(prevStr).toLocal();
    return current.day != prev.day ||
        current.month != prev.month ||
        current.year != prev.year;
  }

  Widget _buildDateHeader(String dateStr, bool isDark) {
    final date = DateTime.parse(dateStr).toLocal();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color:
                isDark ? Colors.white.withOpacity(0.1) : Colors.grey.shade200,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            DateFormat('MMM d, y').format(date),
            style: TextStyle(
              fontSize: 12,
              color: isDark ? AppColors.textMuted : Colors.grey.shade600,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message, bool isMe, bool isDark,
      List<ChatMessage> allMessages) {
    // Find reply message if exists
    ChatMessage? repliedMessage;
    if (message.replyToId != null) {
      repliedMessage =
          allMessages.where((m) => m.id == message.replyToId).firstOrNull;
    }

    return GestureDetector(
      onLongPress: () => _setReplyTo(message),
      child: Align(
        alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(
          margin: const EdgeInsets.only(bottom: 8, left: 8, right: 8),
          constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.75),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: isMe
                ? AppColors.primaryBlue
                : (isDark ? AppColors.cardBackground : Colors.white),
            borderRadius: BorderRadius.only(
              topLeft: const Radius.circular(16),
              topRight: const Radius.circular(16),
              bottomLeft: isMe ? const Radius.circular(16) : Radius.zero,
              bottomRight: isMe ? Radius.zero : const Radius.circular(16),
            ),
            border: isMe
                ? null
                : Border.all(
                    color:
                        isDark ? AppColors.borderLight : Colors.grey.shade300),
            boxShadow: isMe
                ? [
                    BoxShadow(
                      color: AppColors.primaryBlue.withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    )
                  ]
                : null,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Show sender name for group messages (not from me)
              if (widget.isGroup && !isMe)
                Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Text(
                    message.senderName ?? message.senderUsername,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      color: AppColors.accentCyan,
                    ),
                  ),
                ),
              // Show reply preview if this is a reply
              if (repliedMessage != null)
                Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isMe
                        ? Colors.white.withOpacity(0.15)
                        : (isDark
                            ? Colors.white.withOpacity(0.05)
                            : Colors.grey.shade100),
                    borderRadius: BorderRadius.circular(8),
                    border: Border(
                      left: BorderSide(
                        color: AppColors.accentCyan,
                        width: 3,
                      ),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        repliedMessage.senderName ??
                            repliedMessage.senderUsername,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                          color: AppColors.accentCyan,
                        ),
                      ),
                      Text(
                        repliedMessage.content.length > 50
                            ? '${repliedMessage.content.substring(0, 50)}...'
                            : repliedMessage.content,
                        style: TextStyle(
                          fontSize: 12,
                          color: isMe
                              ? Colors.white.withOpacity(0.8)
                              : (isDark
                                  ? AppColors.textSecondary
                                  : Colors.grey.shade600),
                        ),
                      ),
                    ],
                  ),
                ),
              Text(
                message.content,
                style: TextStyle(
                  color: isMe
                      ? Colors.white
                      : (isDark ? AppColors.textPrimary : AppColors.lightText),
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                DateFormat('HH:mm')
                    .format(DateTime.parse(message.createdAt).toLocal()),
                style: TextStyle(
                  color: isMe
                      ? Colors.white.withOpacity(0.7)
                      : (isDark ? AppColors.textMuted : Colors.grey.shade500),
                  fontSize: 10,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReplyPreview(bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : Colors.grey.shade100,
        border: Border(
          top: BorderSide(
            color: isDark ? AppColors.borderLight : Colors.grey.shade200,
          ),
          left: BorderSide(
            color: AppColors.accentCyan,
            width: 4,
          ),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Membalas ${_replyToMessage!.senderName ?? _replyToMessage!.senderUsername}',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                    color: AppColors.accentCyan,
                  ),
                ),
                Text(
                  _replyToMessage!.content.length > 50
                      ? '${_replyToMessage!.content.substring(0, 50)}...'
                      : _replyToMessage!.content,
                  style: TextStyle(
                    fontSize: 13,
                    color: isDark
                        ? AppColors.textSecondary
                        : AppColors.lightTextSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close, size: 18),
            onPressed: _clearReply,
            color: isDark ? AppColors.textMuted : Colors.grey.shade600,
          ),
        ],
      ),
    );
  }

  Widget _buildMessageInput(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : Colors.white,
        border: Border(
            top: BorderSide(
                color: isDark ? AppColors.borderLight : Colors.grey.shade200)),
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: isDark
                      ? Colors.white.withOpacity(0.05)
                      : Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                      color:
                          isDark ? AppColors.borderLight : Colors.transparent),
                ),
                child: TextField(
                  controller: _messageController,
                  decoration: const InputDecoration(
                    hintText: 'Ketik pesan...',
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(vertical: 12),
                  ),
                  minLines: 1,
                  maxLines: 4,
                  style: TextStyle(
                      color:
                          isDark ? AppColors.textPrimary : AppColors.lightText),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              decoration: const BoxDecoration(
                color: AppColors.primaryBlue,
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: const Icon(Icons.send, color: Colors.white, size: 20),
                onPressed: _sendMessage,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
