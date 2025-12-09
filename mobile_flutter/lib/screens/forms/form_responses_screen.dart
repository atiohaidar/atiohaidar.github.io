import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

/// Form responses screen for viewing form submissions
class FormResponsesScreen extends StatefulWidget {
  final String formId;
  final String formTitle;

  const FormResponsesScreen({
    super.key,
    required this.formId,
    required this.formTitle,
  });

  @override
  State<FormResponsesScreen> createState() => _FormResponsesScreenState();
}

class _FormResponsesScreenState extends State<FormResponsesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<FormsProvider>().loadFormResponses(widget.formId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<FormsProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: Text('Responses: ${widget.formTitle}'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: _buildBody(provider, isDark),
    );
  }

  Widget _buildBody(FormsProvider provider, bool isDark) {
    if (provider.isLoading && provider.responses.isEmpty) {
      return const LoadingIndicator(message: 'Loading responses...');
    }

    if (provider.responses.isEmpty) {
      return const EmptyState(
        icon: Icons.inbox_outlined,
        title: 'No responses yet',
        subtitle: 'Responses will appear here when submitted',
      );
    }

    return RefreshIndicator(
      onRefresh: () => provider.loadFormResponses(widget.formId),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: provider.responses.length,
        itemBuilder: (context, index) {
          final response = provider.responses[index];
          return _buildResponseCard(response, index + 1, isDark);
        },
      ),
    );
  }

  Widget _buildResponseCard(FormResponse response, int index, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GlassCard(
        onTap: () => _showResponseDetail(response),
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Index circle
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.primaryBlue.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  '$index',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryBlue,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 16),
            // Response info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    response.respondentName ?? 'Anonymous',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color:
                          isDark ? AppColors.textPrimary : AppColors.lightText,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatDate(response.submittedAt),
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark
                          ? AppColors.textMuted
                          : AppColors.lightTextSecondary,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: isDark ? AppColors.textMuted : Colors.grey.shade400,
            ),
          ],
        ),
      ),
    );
  }

  void _showResponseDetail(FormResponse response) async {
    final provider = context.read<FormsProvider>();
    await provider.loadFormResponse(widget.formId, response.id);

    if (!mounted) return;

    final responseDetail = provider.selectedResponse;
    if (responseDetail == null) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _ResponseDetailSheet(
        response: responseDetail,
        respondentName: response.respondentName,
        submittedAt: response.submittedAt,
      ),
    );
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return 'Unknown date';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('MMM d, yyyy • HH:mm').format(date);
    } catch (_) {
      return dateStr;
    }
  }
}

class _ResponseDetailSheet extends StatelessWidget {
  final FormResponseDetail response;
  final String? respondentName;
  final String? submittedAt;

  const _ResponseDetailSheet({
    required this.response,
    this.respondentName,
    this.submittedAt,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? AppColors.borderMedium : Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          // Header
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.primaryBlue.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.person_outline,
                    color: AppColors.primaryBlue,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        respondentName ?? 'Anonymous',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: isDark
                              ? AppColors.textPrimary
                              : AppColors.lightText,
                        ),
                      ),
                      Text(
                        _formatDate(submittedAt),
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark
                              ? AppColors.textMuted
                              : AppColors.lightTextSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: Icon(
                    Icons.close,
                    color: isDark ? AppColors.textMuted : Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          // Answers list
          Flexible(
            child: ListView.separated(
              shrinkWrap: true,
              padding: const EdgeInsets.all(20),
              itemCount: response.answers.length,
              separatorBuilder: (_, __) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final answer = response.answers[index];
                return _buildAnswerItem(answer, index + 1, isDark);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnswerItem(FormAnswer answer, int index, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Q$index. ${answer.questionText}',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color:
                isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark
                ? AppColors.borderMedium.withOpacity(0.2)
                : Colors.grey.shade50,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isDark ? AppColors.borderLight : Colors.grey.shade200,
            ),
          ),
          child: Text(
            answer.answerText,
            style: TextStyle(
              fontSize: 15,
              color: isDark ? AppColors.textPrimary : AppColors.lightText,
            ),
          ),
        ),
      ],
    );
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return 'Unknown date';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('MMM d, yyyy • HH:mm').format(date);
    } catch (_) {
      return dateStr;
    }
  }
}
