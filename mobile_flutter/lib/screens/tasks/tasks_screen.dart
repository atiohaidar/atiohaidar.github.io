import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

/// Tasks screen for managing tasks
class TasksScreen extends StatefulWidget {
  const TasksScreen({super.key});

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TasksProvider>().loadTasks();
    });
  }

  @override
  Widget build(BuildContext context) {
    final tasksProvider = context.watch<TasksProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: RefreshIndicator(
        onRefresh: () => tasksProvider.loadTasks(),
        child: _buildBody(tasksProvider, isDark),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddTaskDialog(context),
        backgroundColor: AppColors.primaryBlue,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildBody(TasksProvider provider, bool isDark) {
    if (provider.isLoading && provider.tasks.isEmpty) {
      return const LoadingIndicator(message: 'Loading tasks...');
    }

    if (provider.error != null && provider.tasks.isEmpty) {
      return ErrorDisplay(
        message: provider.error!,
        onRetry: () => provider.loadTasks(),
      );
    }

    if (provider.tasks.isEmpty) {
      return EmptyState(
        icon: Icons.task_alt,
        title: 'No tasks yet',
        subtitle: 'Tap the + button to create your first task',
        action: ElevatedButton.icon(
          onPressed: () => _showAddTaskDialog(context),
          icon: const Icon(Icons.add),
          label: const Text('Add Task'),
        ),
      );
    }

    return CustomScrollView(
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: SliverToBoxAdapter(
            child: _buildStatsRow(provider, isDark),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          sliver: SliverToBoxAdapter(
            child: Text(
              'All Tasks',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDark ? AppColors.textPrimary : AppColors.lightText,
              ),
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final task = provider.tasks[index];
                return _buildTaskCard(task, provider, isDark);
              },
              childCount: provider.tasks.length,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatsRow(TasksProvider provider, bool isDark) {
    return Row(
      children: [
        Expanded(
          child: _buildStatChip(
            'Total',
            '${provider.tasks.length}',
            AppColors.primaryBlue,
            isDark,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatChip(
            'Pending',
            '${provider.pendingTasks.length}',
            AppColors.warning,
            isDark,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatChip(
            'Completed',
            '${provider.completedTasks.length}',
            AppColors.success,
            isDark,
          ),
        ),
      ],
    );
  }

  Widget _buildStatChip(String label, String value, Color color, bool isDark) {
    return GlassCard(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: isDark ? AppColors.textMuted : Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTaskCard(Task task, TasksProvider provider, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassCard(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            GestureDetector(
              onTap: () => provider.toggleTaskCompletion(task),
              child: Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color:
                      task.completed ? AppColors.success : Colors.transparent,
                  border: Border.all(
                    color: task.completed
                        ? AppColors.success
                        : (isDark
                            ? AppColors.borderMedium
                            : Colors.grey.shade400),
                    width: 2,
                  ),
                ),
                child: task.completed
                    ? const Icon(Icons.check, color: Colors.white, size: 18)
                    : null,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: GestureDetector(
                onTap: () => _showEditTaskDialog(context, task),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      task.name,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isDark
                            ? AppColors.textPrimary
                            : AppColors.lightText,
                        decoration:
                            task.completed ? TextDecoration.lineThrough : null,
                      ),
                    ),
                    if (task.description != null &&
                        task.description!.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          task.description!,
                          style: TextStyle(
                            fontSize: 14,
                            color: isDark
                                ? AppColors.textMuted
                                : Colors.grey.shade600,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    if (task.dueDate != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Row(
                          children: [
                            Icon(
                              Icons.calendar_today,
                              size: 14,
                              color: isDark
                                  ? AppColors.textMuted
                                  : Colors.grey.shade500,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              task.dueDate!,
                              style: TextStyle(
                                fontSize: 12,
                                color: isDark
                                    ? AppColors.textMuted
                                    : Colors.grey.shade500,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ),
            IconButton(
              icon: Icon(
                Icons.delete_outline,
                color: AppColors.error.withOpacity(0.7),
              ),
              onPressed: () => _confirmDelete(task, provider),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddTaskDialog(BuildContext context) {
    final nameController = TextEditingController();
    final descController = TextEditingController();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color:
                        isDark ? AppColors.borderMedium : Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Add New Task',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppColors.textPrimary : AppColors.lightText,
                ),
              ),
              const SizedBox(height: 24),
              TextField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: 'Task Name',
                  hintText: 'Enter task name',
                ),
                autofocus: true,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: descController,
                decoration: const InputDecoration(
                  labelText: 'Description (optional)',
                  hintText: 'Enter task description',
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () async {
                  if (nameController.text.trim().isNotEmpty) {
                    final provider = context.read<TasksProvider>();
                    final success = await provider.createTask(TaskCreate(
                      name: nameController.text.trim(),
                      description: descController.text.trim().isNotEmpty
                          ? descController.text.trim()
                          : null,
                    ));
                    if (success && context.mounted) {
                      Navigator.pop(context);
                    }
                  }
                },
                child: const Text('Add Task'),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  void _showEditTaskDialog(BuildContext context, Task task) {
    final nameController = TextEditingController(text: task.name);
    final descController = TextEditingController(text: task.description);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color:
                        isDark ? AppColors.borderMedium : Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Edit Task',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppColors.textPrimary : AppColors.lightText,
                ),
              ),
              const SizedBox(height: 24),
              TextField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: 'Task Name',
                  hintText: 'Enter task name',
                ),
                autofocus: true,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: descController,
                decoration: const InputDecoration(
                  labelText: 'Description (optional)',
                  hintText: 'Enter task description',
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () async {
                  if (nameController.text.trim().isNotEmpty) {
                    final provider = context.read<TasksProvider>();
                    final success = await provider.updateTask(
                      task.id,
                      TaskUpdate(
                        name: nameController.text.trim(),
                        description: descController.text.trim().isNotEmpty
                            ? descController.text.trim()
                            : null,
                      ),
                    );
                    if (success && context.mounted) {
                      Navigator.pop(context);
                    }
                  }
                },
                child: const Text('Save Changes'),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  void _confirmDelete(Task task, TasksProvider provider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Task'),
        content: Text('Are you sure you want to delete "${task.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              provider.deleteTask(task.id);
              Navigator.pop(context);
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
