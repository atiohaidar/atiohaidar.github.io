import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

/// Users screen for admin to manage users
class UsersScreen extends StatefulWidget {
  const UsersScreen({super.key});

  @override
  State<UsersScreen> createState() => _UsersScreenState();
}

class _UsersScreenState extends State<UsersScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<UsersProvider>().loadUsers();
    });
  }

  @override
  Widget build(BuildContext context) {
    final usersProvider = context.watch<UsersProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Users Management'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Add new user
        },
        backgroundColor: AppColors.primaryBlue,
        child: const Icon(Icons.person_add, color: Colors.white),
      ),
      body: _buildBody(usersProvider, isDark),
    );
  }

  Widget _buildBody(UsersProvider provider, bool isDark) {
    if (provider.isLoading && provider.users.isEmpty) {
      return const LoadingIndicator(message: 'Loading users...');
    }

    if (provider.error != null && provider.users.isEmpty) {
      return ErrorDisplay(
        message: provider.error!,
        onRetry: () => provider.loadUsers(),
      );
    }

    if (provider.users.isEmpty) {
      return const EmptyState(
        icon: Icons.people_outline,
        title: 'No users found',
        subtitle: 'System has no users',
      );
    }

    return RefreshIndicator(
      onRefresh: () => provider.loadUsers(),
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: provider.users.length,
        separatorBuilder: (context, index) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final user = provider.users[index];
          return _buildUserCard(user, isDark);
        },
      ),
    );
  }

  Widget _buildUserCard(User user, bool isDark) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: AppColors.primaryBlue.withOpacity(0.1),
            child: Text(
              user.name[0].toUpperCase(),
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
                  children: [
                    Expanded(
                      child: Text(
                        user.name,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isDark ? AppColors.textPrimary : AppColors.lightText,
                        ),
                      ),
                    ),
                    if (user.isAdmin)
                      Padding(
                        padding: const EdgeInsets.only(left: 8),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.purple.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'ADMIN',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: AppColors.purple,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '@${user.username}',
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),

          IconButton(
            icon: Icon(
              Icons.more_vert,
              color: isDark ? AppColors.textMuted : Colors.grey.shade400,
            ),
            onPressed: () {
              // TODO: Edit/Delete user
            },
          ),
        ],
      ),
    );
  }
}
