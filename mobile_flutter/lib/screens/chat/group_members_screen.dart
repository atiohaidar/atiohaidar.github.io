import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../services/services.dart';
import '../../models/models.dart';
import '../../widgets/widgets.dart';
import '../../providers/providers.dart';

/// Group Members Management Screen
class GroupMembersScreen extends StatefulWidget {
  final String groupId;
  final ChatGroup? group;

  const GroupMembersScreen({super.key, required this.groupId, this.group});

  @override
  State<GroupMembersScreen> createState() => _GroupMembersScreenState();
}

class _GroupMembersScreenState extends State<GroupMembersScreen> {
  List<GroupMember> _members = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadMembers();
  }

  Future<void> _loadMembers() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final members = await ApiService.getGroupMembers(widget.groupId);
      setState(() {
        _members = members;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _addMember() async {
    final controller = TextEditingController();
    final result = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Member',
            style: TextStyle(color: AppColors.textPrimary)),
        backgroundColor: AppColors.darkSurface,
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'Username',
            hintText: 'Enter username to add',
          ),
          style: const TextStyle(color: AppColors.textPrimary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('Add'),
          ),
        ],
      ),
    );

    if (result != null && result.isNotEmpty) {
      try {
        await ApiService.addGroupMember(widget.groupId, result);
        _loadMembers();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Member added successfully')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e')),
          );
        }
      }
    }
  }

  Future<void> _removeMember(GroupMember member) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Member',
            style: TextStyle(color: AppColors.textPrimary)),
        backgroundColor: AppColors.darkSurface,
        content: Text(
          'Remove ${member.userUsername} from the group?',
          style: const TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Remove'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await ApiService.removeGroupMember(widget.groupId, member.userUsername);
        _loadMembers();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Member removed')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e')),
          );
        }
      }
    }
  }

  Future<void> _changeRole(GroupMember member) async {
    final newRole = member.role == 'admin' ? 'member' : 'admin';
    try {
      await ApiService.updateGroupMemberRole(
          widget.groupId, member.userUsername, newRole);
      _loadMembers();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Role changed to $newRole')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final authProvider = context.read<AuthProvider>();
    final currentUser = authProvider.user?.username;

    // Check if current user is admin
    final currentMember =
        _members.where((m) => m.userUsername == currentUser).firstOrNull;
    final isAdmin = currentMember?.role == 'admin';

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: Text(widget.group?.name ?? 'Group Members'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      floatingActionButton: isAdmin
          ? FloatingActionButton(
              onPressed: _addMember,
              backgroundColor: AppColors.primaryBlue,
              child: const Icon(Icons.person_add, color: Colors.white),
            )
          : null,
      body: _buildBody(isDark, currentUser, isAdmin),
    );
  }

  Widget _buildBody(bool isDark, String? currentUser, bool isAdmin) {
    if (_isLoading) {
      return const LoadingIndicator(message: 'Loading members...');
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 64, color: AppColors.error),
            const SizedBox(height: 16),
            const Text('Error loading members',
                style: TextStyle(color: AppColors.textPrimary)),
            const SizedBox(height: 8),
            ElevatedButton(onPressed: _loadMembers, child: const Text('Retry')),
          ],
        ),
      );
    }

    if (_members.isEmpty) {
      return const EmptyState(
        icon: Icons.group_off,
        title: 'No members',
        subtitle: 'This group has no members',
      );
    }

    return RefreshIndicator(
      onRefresh: _loadMembers,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _members.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final member = _members[index];
          return _buildMemberCard(member, isDark, currentUser, isAdmin);
        },
      ),
    );
  }

  Widget _buildMemberCard(
      GroupMember member, bool isDark, String? currentUser, bool isAdmin) {
    final isCurrentUser = member.userUsername == currentUser;

    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: member.role == 'admin'
                ? AppColors.purple.withOpacity(0.1)
                : AppColors.primaryBlue.withOpacity(0.1),
            child: Text(
              member.userUsername[0].toUpperCase(),
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: member.role == 'admin'
                    ? AppColors.purple
                    : AppColors.primaryBlue,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        member.userUsername,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: isDark
                              ? AppColors.textPrimary
                              : AppColors.lightText,
                        ),
                      ),
                    ),
                    if (isCurrentUser)
                      const Padding(
                        padding: EdgeInsets.only(left: 8),
                        child: Text(
                          '(You)',
                          style: TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 12,
                          ),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: member.role == 'admin'
                  ? AppColors.purple.withOpacity(0.1)
                  : Colors.grey.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              member.role.toUpperCase(),
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: member.role == 'admin'
                    ? AppColors.purple
                    : AppColors.textMuted,
              ),
            ),
          ),
          if (isAdmin && !isCurrentUser) ...[
            PopupMenuButton<String>(
              icon: Icon(
                Icons.more_vert,
                color: isDark ? AppColors.textMuted : Colors.grey,
              ),
              onSelected: (value) {
                if (value == 'role') {
                  _changeRole(member);
                } else if (value == 'remove') {
                  _removeMember(member);
                }
              },
              itemBuilder: (context) => [
                PopupMenuItem(
                  value: 'role',
                  child: Text(member.role == 'admin'
                      ? 'Demote to Member'
                      : 'Promote to Admin'),
                ),
                const PopupMenuItem(
                  value: 'remove',
                  child:
                      Text('Remove', style: TextStyle(color: AppColors.error)),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
