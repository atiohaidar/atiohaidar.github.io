import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

/// Screen to list all conversations
class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ChatProvider>().loadConversations();
    });
  }

  @override
  Widget build(BuildContext context) {
    final chatProvider = context.watch<ChatProvider>();
    final authProvider = context.read<AuthProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Messages'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _showNewChatDialog(context);
        },
        backgroundColor: AppColors.primaryBlue,
        child: const Icon(Icons.message, color: Colors.white),
      ),
      body: _buildBody(chatProvider, authProvider, isDark),
    );
  }

  Widget _buildBody(
      ChatProvider provider, AuthProvider authProvider, bool isDark) {
    if (provider.isLoading && provider.conversations.isEmpty) {
      return const LoadingIndicator(message: 'Loading conversations...');
    }

    if (provider.conversations.isEmpty) {
      return const EmptyState(
        icon: Icons.chat_bubble_outline,
        title: 'No messages',
        subtitle: 'Start a conversation with someone',
      );
    }

    return RefreshIndicator(
      onRefresh: () => provider.loadConversations(),
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: provider.conversations.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final conversation = provider.conversations[index];
          return _buildConversationCard(
              conversation, authProvider.user?.username, isDark);
        },
      ),
    );
  }

  Widget _buildConversationCard(
      ChatConversation conversation, String? currentUsername, bool isDark) {
    // Determine the other user's name/username
    final isUser1 = conversation.user1Username == currentUsername;
    final otherUsername =
        isUser1 ? conversation.user2Username : conversation.user1Username;
    final otherName = conversation.otherName ?? otherUsername;

    return GestureDetector(
      onTap: () {
        context.push('/chat/${conversation.id}', extra: conversation);
      },
      child: GlassCard(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: AppColors.primaryBlue.withOpacity(0.1),
              child: Text(
                otherName[0].toUpperCase(),
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryBlue,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          otherName,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: isDark
                                ? AppColors.textPrimary
                                : AppColors.lightText,
                          ),
                        ),
                      ),
                      if (conversation.lastMessageTime != null)
                        Text(
                          _formatTime(conversation.lastMessageTime!),
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark
                                ? AppColors.textMuted
                                : Colors.grey.shade600,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  if (conversation.lastMessage != null)
                    Text(
                      conversation.lastMessage!,
                      style: TextStyle(
                        fontSize: 14,
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
          ],
        ),
      ),
    );
  }

  String _formatTime(String isoString) {
    final date = DateTime.parse(isoString).toLocal();
    final now = DateTime.now();

    if (date.year == now.year &&
        date.month == now.month &&
        date.day == now.day) {
      return DateFormat('HH:mm').format(date);
    } else if (date.year == now.year) {
      return DateFormat('MM/dd').format(date);
    } else {
      return DateFormat('MM/dd/yy').format(date);
    }
  }

  void _showNewChatDialog(BuildContext context) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('New Message',
            style: TextStyle(
                color: AppColors
                    .textPrimary)), // Assuming dark theme default for dialog
        backgroundColor: AppColors.darkSurface,
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'Username',
            hintText: 'Enter username to chat with',
          ),
          style: const TextStyle(color: AppColors.textPrimary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (controller.text.trim().isNotEmpty) {
                try {
                  await context
                      .read<ChatProvider>()
                      .createConversation(controller.text.trim());
                  if (context.mounted) {
                    Navigator.pop(context);
                    // Navigate to the newest conversation (idx 0)
                    final newConv =
                        context.read<ChatProvider>().conversations.first;
                    context.push('/chat/${newConv.id}', extra: newConv);
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Error: $e')),
                    );
                  }
                }
              }
            },
            child: const Text('Start Chat'),
          ),
        ],
      ),
    );
  }
}
