import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

/// Screen to list all conversations and groups
class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ChatProvider>().loadConversations();
      context.read<ChatProvider>().loadGroups();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final chatProvider = context.watch<ChatProvider>();
    final authProvider = context.read<AuthProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Pesan'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primaryBlue,
          labelColor: isDark ? AppColors.textPrimary : AppColors.lightText,
          unselectedLabelColor:
              isDark ? AppColors.textMuted : Colors.grey.shade600,
          tabs: const [
            Tab(text: 'Langsung', icon: Icon(Icons.person)),
            Tab(text: 'Grup', icon: Icon(Icons.group)),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          if (_tabController.index == 0) {
            _showNewChatDialog(context);
          } else {
            _showNewGroupDialog(context);
          }
        },
        backgroundColor: AppColors.primaryBlue,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildConversationsTab(chatProvider, authProvider, isDark),
          _buildGroupsTab(chatProvider, isDark),
        ],
      ),
    );
  }

  Widget _buildConversationsTab(
      ChatProvider provider, AuthProvider authProvider, bool isDark) {
    if (provider.isLoading && provider.conversations.isEmpty) {
      return const LoadingIndicator(message: 'Memuat percakapan...');
    }

    if (provider.conversations.isEmpty) {
      return const EmptyState(
        icon: Icons.chat_bubble_outline,
        title: 'Tidak ada pesan',
        subtitle: 'Mulai percakapan dengan seseorang',
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

  Widget _buildGroupsTab(ChatProvider provider, bool isDark) {
    if (provider.isLoading && provider.groups.isEmpty) {
      return const LoadingIndicator(message: 'Memuat grup...');
    }

    if (provider.groups.isEmpty) {
      return const EmptyState(
        icon: Icons.group_off,
        title: 'Tidak ada grup',
        subtitle: 'Buat atau gabung grup untuk mulai mengobrol',
      );
    }

    return RefreshIndicator(
      onRefresh: () => provider.loadGroups(),
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: provider.groups.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final group = provider.groups[index];
          return _buildGroupCard(group, isDark);
        },
      ),
    );
  }

  Widget _buildConversationCard(
      ChatConversation conversation, String? currentUsername, bool isDark) {
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

  Widget _buildGroupCard(ChatGroup group, bool isDark) {
    return GestureDetector(
      onTap: () {
        context.push('/chat/${group.id}', extra: group);
      },
      child: GlassCard(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: AppColors.purple.withOpacity(0.1),
              child: const Icon(
                Icons.group,
                color: AppColors.purple,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    group.name,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color:
                          isDark ? AppColors.textPrimary : AppColors.lightText,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    group.description ?? '${group.memberCount ?? 0} anggota',
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
        title: const Text('Pesan Baru',
            style: TextStyle(color: AppColors.textPrimary)),
        backgroundColor: AppColors.darkSurface,
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'Username',
            hintText: 'Masukkan username untuk mengobrol',
          ),
          style: const TextStyle(color: AppColors.textPrimary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (controller.text.trim().isNotEmpty) {
                try {
                  await context
                      .read<ChatProvider>()
                      .getOrCreateConversation(controller.text.trim());
                  if (context.mounted) {
                    Navigator.pop(context);
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
            child: const Text('Mulai Chat'),
          ),
        ],
      ),
    );
  }

  void _showNewGroupDialog(BuildContext context) {
    final nameController = TextEditingController();
    final descController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Grup Baru',
            style: TextStyle(color: AppColors.textPrimary)),
        backgroundColor: AppColors.darkSurface,
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Nama Grup',
                hintText: 'Masukkan nama grup',
              ),
              style: const TextStyle(color: AppColors.textPrimary),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: descController,
              decoration: const InputDecoration(
                labelText: 'Deskripsi (opsional)',
                hintText: 'Masukkan deskripsi',
              ),
              style: const TextStyle(color: AppColors.textPrimary),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (nameController.text.trim().isNotEmpty) {
                try {
                  await context.read<ChatProvider>().createGroup(GroupCreate(
                        name: nameController.text.trim(),
                        description: descController.text.trim().isNotEmpty
                            ? descController.text.trim()
                            : null,
                      ));
                  if (context.mounted) {
                    Navigator.pop(context);
                    final newGroup = context.read<ChatProvider>().groups.first;
                    context.push('/chat/${newGroup.id}', extra: newGroup);
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
            child: const Text('Buat Grup'),
          ),
        ],
      ),
    );
  }
}
