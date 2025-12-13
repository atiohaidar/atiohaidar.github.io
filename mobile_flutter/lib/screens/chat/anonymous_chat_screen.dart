import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/anonymous_chat_provider.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

/// Anonymous chat screen for public chatroom
class AnonymousChatScreen extends StatefulWidget {
  const AnonymousChatScreen({super.key});

  @override
  State<AnonymousChatScreen> createState() => _AnonymousChatScreenState();
}

class _AnonymousChatScreenState extends State<AnonymousChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  String? _replyToId;
  String? _replyContent;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = context.read<AuthProvider>();
      final chatProvider = context.read<AnonymousChatProvider>();

      // Initialize sender ID from current user
      if (authProvider.user != null) {
        chatProvider.initSenderId(authProvider.user!.username);
      }

      chatProvider.loadMessages();
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _setReply(AnonymousMessage message) {
    setState(() {
      _replyToId = message.id;
      _replyContent = message.content.length > 50
          ? '${message.content.substring(0, 50)}...'
          : message.content;
    });
  }

  void _clearReply() {
    setState(() {
      _replyToId = null;
      _replyContent = null;
    });
  }

  Future<void> _sendMessage() async {
    final content = _messageController.text.trim();
    if (content.isEmpty) return;

    final provider = context.read<AnonymousChatProvider>();
    final success = await provider.sendMessage(content, replyToId: _replyToId);

    if (success) {
      _messageController.clear();
      _clearReply();
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    final chatProvider = context.watch<AnonymousChatProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Obrolan Anonim'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => chatProvider.loadMessages(),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: _buildMessagesList(chatProvider, isDark),
          ),
          _buildMessageInput(chatProvider, isDark),
        ],
      ),
    );
  }

  Widget _buildMessagesList(AnonymousChatProvider provider, bool isDark) {
    if (provider.isLoading && provider.messages.isEmpty) {
      return const LoadingIndicator(message: 'Memuat pesan...');
    }

    if (provider.messages.isEmpty) {
      return const EmptyState(
        icon: Icons.chat_bubble_outline,
        title: 'Belum ada pesan',
        subtitle: 'Jadilah yang pertama memulai percakapan!',
      );
    }

    return RefreshIndicator(
      onRefresh: () => provider.loadMessages(),
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(16),
        itemCount: provider.messages.length,
        itemBuilder: (context, index) {
          final message = provider.messages[index];
          final isOwn = provider.isOwnMessage(message);
          return _buildMessageBubble(message, isOwn, isDark);
        },
      ),
    );
  }

  Widget _buildMessageBubble(
      AnonymousMessage message, bool isOwn, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment:
            isOwn ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (isOwn) const Spacer(),
          Flexible(
            flex: 3,
            child: GestureDetector(
              onLongPress: () => _setReply(message),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isOwn
                      ? AppColors.primaryBlue.withOpacity(0.8)
                      : (isDark
                          ? AppColors.darkSurface.withOpacity(0.8)
                          : Colors.grey.shade200),
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(16),
                    topRight: const Radius.circular(16),
                    bottomLeft: Radius.circular(isOwn ? 16 : 4),
                    bottomRight: Radius.circular(isOwn ? 4 : 16),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Reply indicator if this is a reply
                    if (message.replyContent != null) ...[
                      Container(
                        padding: const EdgeInsets.all(8),
                        margin: const EdgeInsets.only(bottom: 8),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border(
                            left: BorderSide(
                              color: AppColors.purple,
                              width: 3,
                            ),
                          ),
                        ),
                        child: Text(
                          message.replyContent!,
                          style: TextStyle(
                            fontSize: 12,
                            fontStyle: FontStyle.italic,
                            color: isOwn
                                ? Colors.white70
                                : (isDark
                                    ? AppColors.textMuted
                                    : Colors.grey.shade600),
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                    // Sender ID (anonymized)
                    Text(
                      message.senderId,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: isOwn ? Colors.white70 : AppColors.purple,
                      ),
                    ),
                    const SizedBox(height: 4),
                    // Message content
                    Text(
                      message.content,
                      style: TextStyle(
                        fontSize: 15,
                        color: isOwn
                            ? Colors.white
                            : (isDark
                                ? AppColors.textPrimary
                                : AppColors.lightText),
                      ),
                    ),
                    const SizedBox(height: 4),
                    // Timestamp
                    Text(
                      _formatTime(message.createdAt),
                      style: TextStyle(
                        fontSize: 10,
                        color: isOwn
                            ? Colors.white60
                            : (isDark
                                ? AppColors.textMuted
                                : Colors.grey.shade500),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (!isOwn) const Spacer(),
        ],
      ),
    );
  }

  Widget _buildMessageInput(AnonymousChatProvider provider, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.darkSurface.withOpacity(0.9)
            : Colors.white.withOpacity(0.9),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Reply preview
            if (_replyToId != null) ...[
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: isDark
                      ? AppColors.borderMedium.withOpacity(0.3)
                      : Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                  border: Border(
                    left: BorderSide(
                      color: AppColors.purple,
                      width: 3,
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
                            'Membalas ke',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppColors.purple,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            _replyContent ?? '',
                            style: TextStyle(
                              fontSize: 13,
                              color: isDark
                                  ? AppColors.textMuted
                                  : Colors.grey.shade600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: Icon(
                        Icons.close,
                        size: 18,
                        color:
                            isDark ? AppColors.textMuted : Colors.grey.shade600,
                      ),
                      onPressed: _clearReply,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
              ),
            ],
            // Input row
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Ketik pesan...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: isDark
                          ? AppColors.borderMedium.withOpacity(0.3)
                          : Colors.grey.shade100,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                    maxLines: 3,
                    minLines: 1,
                    textCapitalization: TextCapitalization.sentences,
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.primaryBlue,
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white),
                    onPressed: _sendMessage,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(String createdAt) {
    try {
      final date = DateTime.parse(createdAt);
      final now = DateTime.now();
      if (date.year == now.year &&
          date.month == now.month &&
          date.day == now.day) {
        return DateFormat('HH:mm').format(date);
      }
      return DateFormat('MMM d, HH:mm').format(date);
    } catch (_) {
      return createdAt;
    }
  }
}
