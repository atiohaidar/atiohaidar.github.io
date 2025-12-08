import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

/// Individual Chat Screen
class ChatScreen extends StatefulWidget {
  final String conversationId;
  final ChatConversation? conversation; // Passed for initial header info

  const ChatScreen({
    super.key,
    required this.conversationId,
    this.conversation,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ChatProvider>().loadMessages(widget.conversationId);
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    // No need to call leaveConversation here necessarily, but can clean up
    super.dispose();
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    context.read<ChatProvider>().sendMessage(text);
    _messageController.clear();

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
    if (widget.conversation != null) {
      final isUser1 =
          widget.conversation!.user1Username == authProvider.user?.username;
      title = widget.conversation!.otherName ??
          (isUser1
              ? widget.conversation!.user2Username
              : widget.conversation!.user1Username);
    }

    return Scaffold(
      backgroundColor:
          Colors.transparent, // Handled by GradientBackground in wrapper
      appBar: AppBar(
        title: Text(title),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: Column(
        children: [
          Expanded(
            child: _buildMessagesList(chatProvider, authProvider, isDark),
          ),
          _buildMessageInput(isDark),
        ],
      ),
    );
  }

  Widget _buildMessagesList(
      ChatProvider provider, AuthProvider authProvider, bool isDark) {
    if (provider.isLoading && provider.messages.isEmpty) {
      return const LoadingIndicator(message: 'Loading messages...');
    }

    if (provider.messages.isEmpty) {
      return Center(
        child: Text(
          'No messages yet',
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
            _buildMessageBubble(message, isMe, isDark),
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

  Widget _buildMessageBubble(ChatMessage message, bool isMe, bool isDark) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8, left: 8, right: 8),
        constraints:
            BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
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
                  color: isDark ? AppColors.borderLight : Colors.grey.shade300),
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
            IconButton(
              icon: Icon(Icons.add,
                  color: isDark ? AppColors.textMuted : Colors.grey.shade600),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                      content: Text('Attachments not implemented yet')),
                );
              },
            ),
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
                    hintText: 'Type a message...',
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
