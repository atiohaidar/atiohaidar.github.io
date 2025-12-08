import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

/// Forms screen for viewing and managing forms
class FormsScreen extends StatefulWidget {
  const FormsScreen({super.key});

  @override
  State<FormsScreen> createState() => _FormsScreenState();
}

class _FormsScreenState extends State<FormsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<FormsProvider>().loadForms();
    });
  }

  @override
  Widget build(BuildContext context) {
    final formsProvider = context.watch<FormsProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Forms'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Navigate to create form screen
        },
        backgroundColor: AppColors.primaryBlue,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: _buildBody(formsProvider, isDark),
    );
  }

  Widget _buildBody(FormsProvider provider, bool isDark) {
    if (provider.isLoading && provider.forms.isEmpty) {
      return const LoadingIndicator(message: 'Loading forms...');
    }

    if (provider.error != null && provider.forms.isEmpty) {
      return ErrorDisplay(
        message: provider.error!,
        onRetry: () => provider.loadForms(),
      );
    }

    if (provider.forms.isEmpty) {
      return const EmptyState(
        icon: Icons.dynamic_form_outlined,
        title: 'No forms created',
        subtitle: 'Create forms to collect data',
      );
    }

    return RefreshIndicator(
      onRefresh: () => provider.loadForms(),
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: provider.forms.length,
        separatorBuilder: (context, index) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final form = provider.forms[index];
          return _buildFormCard(form, isDark);
        },
      ),
    );
  }

  Widget _buildFormCard(FormData form, bool isDark) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  form.title,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? AppColors.textPrimary : AppColors.lightText,
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.share_outlined, size: 20),
                onPressed: () {
                  // TODO: Share form link
                },
              ),
            ],
          ),
          if (form.description != null) ...[
            const SizedBox(height: 8),
            Text(
              form.description!,
              style: TextStyle(
                fontSize: 14,
                color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          const SizedBox(height: 16),
          Row(
            children: [
              Icon(
                Icons.person_outline,
                size: 16,
                color: isDark ? AppColors.textMuted : Colors.grey.shade600,
              ),
              const SizedBox(width: 4),
              Text(
                'Created by ${form.createdBy}',
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                ),
              ),
              const Spacer(),
              if (form.createdAt != null)
                Text(
                  DateFormat('MMM d, y').format(DateTime.parse(form.createdAt!)),
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    // TODO: View responses
                  },
                  icon: const Icon(Icons.bar_chart),
                  label: const Text('Responses'),
                  style: OutlinedButton.styleFrom(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    // TODO: View/Edit form
                  },
                  icon: const Icon(Icons.visibility_outlined),
                  label: const Text('View'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryBlue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
